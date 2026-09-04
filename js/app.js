(function(){
  "use strict";
  var ORO="#FCB827", NEGRO="#000000", BLANCO="#ffffff";
  var FF='"DM Sans", Arial, sans-serif';
  var PXMM=24;                        // 24 px/mm = 609.6 dpi (alta calidad de impresion)
  var PPU=PXMM*1000;                  // pixeles por metro para el chunk pHYs del PNG

  var PRODUCTOS = [
    {base:"CC",  nombre:"Camiseta Corta Feminina",          talla:"S",     color:"Negro", precio:"39900"},
    {base:"CDC", nombre:"Camisilla Deportiva Clásica",      talla:"M",     color:"Negro", precio:"35900"},
    {base:"CDC", nombre:"Camisilla Deportiva Clásica",      talla:"L",     color:"Negro", precio:"35900"},
    {base:"CDC", nombre:"Camisilla Deportiva Clásica",      talla:"XL",    color:"Negro", precio:"35900"},
    {base:"CC",  nombre:"Camiseta Corta Feminina",          talla:"M",     color:"Negro", precio:"39900"},
    {base:"CDA", nombre:"Camisilla Deportiva Corte Amplio", talla:"M",     color:"Negro", precio:"42900"},
    {base:"CDA", nombre:"Camisilla Deportiva Corte Amplio", talla:"L",     color:"Negro", precio:"42900"},
    {base:"CDA", nombre:"Camisilla Deportiva Corte Amplio", talla:"XL",    color:"Negro", precio:"42900"},
    {base:"GM",  nombre:"Gorra de malla",                   talla:"Única", color:"Negro", precio:"44900"}
  ];
  var COLOR_COD = {"NEGRO":"NE","BLANCO":"BL","ROJO":"RO","AZUL":"AZ","VERDE":"VE",
    "GRIS":"GR","AMARILLO":"AM","ROSADO":"RS","ROSA":"RS","MORADO":"MO","NARANJA":"NA",
    "BEIGE":"BE","CAFE":"CA","CAFÉ":"CA","VINOTINTO":"VT","CELESTE":"CE"};

  var $=function(id){return document.getElementById(id);};
  var sel=$("selProducto"), inSku=$("inSku"), inNombre=$("inNombre"), inTalla=$("inTalla"),
      inColor=$("inColor"), inDiseno=$("inDiseno"), inPrecio=$("inPrecio"), inSkuVis=$("inSkuVis"),
      inCopias=$("inCopias"), msg=$("msg"), canvas=$("labelCanvas");
  var currentBase="CC";

  // canvas a tamaño exacto (30x70mm)
  canvas.width=Math.round(30*PXMM); canvas.height=Math.round(70*PXMM);

  var LOGO=new Image(), logoReady=false;
  LOGO.onload=function(){ logoReady=true; generar(); };
  LOGO.src="assets/logo-kroton.png";

  PRODUCTOS.forEach(function(p,i){
    var o=document.createElement("option");
    o.value=String(i); o.textContent=p.nombre+" · Talla "+p.talla;
    sel.appendChild(o);
  });

  function mm(v){ return v*PXMM; }
  function pt(p){ return p*0.352777*PXMM; }   // puntos -> px
  function setLS(ctx,v){ if(ctx.letterSpacing!==undefined) ctx.letterSpacing=v; }
  function pad2(n){ n=parseInt(n,10); if(isNaN(n)||n<1) n=1; return (n<10?"0":"")+n; }
  function noAcentos(s){ return s.normalize("NFD").replace(/[̀-ͯ]/g,""); }
  function colorCode(c){
    var k=noAcentos((c||"").trim().toUpperCase());
    if(COLOR_COD[k]) return COLOR_COD[k];
    return (k.replace(/[^A-Z0-9]/g,"").slice(0,2)) || "XX";
  }
  function tallaCode(t){
    var k=noAcentos((t||"").trim().toUpperCase());
    if(k==="UNICA"||k==="U") return "U";
    return k.replace(/[^A-Z0-9]/g,"");
  }
  function buildSku(){
    var s="KRO-"+currentBase+"-"+tallaCode(inTalla.value)+"-"+colorCode(inColor.value)+"-"+pad2(inDiseno.value);
    inSku.value=s; return s;
  }
  function fmtPrecio(v){
    v=(v||"").trim(); var d=v.replace(/[^0-9]/g,"");
    if(!d) return v;
    return "$"+d.replace(/\B(?=(\d{3})+(?!\d))/g,".");
  }

  sel.addEventListener("change",function(){
    if(sel.value===""){ return; }
    var p=PRODUCTOS[+sel.value];
    currentBase=p.base;
    inNombre.value=p.nombre; inTalla.value=p.talla; inColor.value=p.color; inPrecio.value=p.precio;
    buildSku(); generar();
  });
  [inTalla,inColor,inDiseno].forEach(function(el){
    el.addEventListener("input",function(){ buildSku(); generar(); });
  });
  [inNombre,inPrecio].forEach(function(el){ el.addEventListener("input", generar); });
  inSkuVis.addEventListener("change", generar);
  inSku.addEventListener("keyup",function(e){ if(e.key==="Enter") generar(); });

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function wrapText(ctx, text, maxW){
    var words=text.split(" "), lines=[], cur="";
    for(var i=0;i<words.length;i++){
      var t=cur?cur+" "+words[i]:words[i];
      if(ctx.measureText(t).width<=maxW || !cur){ cur=t; }
      else { lines.push(cur); cur=words[i]; }
    }
    if(cur) lines.push(cur);
    return lines;
  }
  // Dibuja el nombre. 6pt en 1 linea si cabe; si no, 5pt partido en varias lineas.
  // Devuelve la baseline de la ultima linea.
  function drawName(ctx, name, cx, topY, innerW){
    ctx.textAlign="center"; ctx.fillStyle=ORO;
    var s6=pt(6); ctx.font="900 "+s6+"px "+FF;
    if(ctx.measureText(name).width<=innerW){
      ctx.fillText(name, cx, topY);
      return topY;
    }
    var s5=pt(5); ctx.font="900 "+s5+"px "+FF;
    var lines=wrapText(ctx, name, innerW), lead=pt(5)*1.18, y=topY;
    for(var i=0;i<lines.length;i++){ ctx.fillText(lines[i], cx, y); if(i<lines.length-1) y+=lead; }
    return y;
  }
  function drawLabelValue(ctx, lab, val, cx, y, fs){
    var fL="300 "+fs+"px "+FF, fV="900 "+fs+"px "+FF;
    ctx.font=fL; var wl=ctx.measureText(lab).width;
    ctx.font=fV; var wv=ctx.measureText(val).width;
    var sx=cx-(wl+wv)/2;
    ctx.textAlign="left"; ctx.fillStyle=ORO;
    ctx.font=fL; ctx.fillText(lab, sx, y);
    ctx.font=fV; ctx.fillText(val, sx+wl, y);
    ctx.textAlign="center";
  }

  function dibujar(cv, data){
    var W=cv.width, H=cv.height, ctx=cv.getContext("2d");
    var CX=W/2, TL=mm(5), TR=W-mm(5), TT=mm(5), TB=H-mm(5);   // area de corte
    var innerW=mm(17.5);                                       // ancho seguro (no toca sangria)
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=NEGRO; ctx.fillRect(0,0,W,H);
    // agujero de colgado (0,08 cm de diametro -> radio 0,04 cm), centro a 0,39 cm del corte
    ctx.fillStyle=BLANCO; ctx.beginPath(); ctx.arc(CX, mm(5+0.39*10), mm(0.04*10), 0, Math.PI*2); ctx.fill();
    // logo: 0,975 x 1 cm, centro vertical a 1,37 cm del corte
    if(logoReady){
      var lw=mm(9.75), lh=mm(10);
      ctx.drawImage(LOGO, CX-lw/2, mm(5+1.37*10)-lh/2, lw, lh);
    }
    // bloque nombre / talla / color  (baselines: 2,63 / 2,91 / 3,23 cm del corte)
    ctx.textBaseline="alphabetic"; setLS(ctx,"0.05em");
    var LEADB=mm(3.0);
    var lastName=drawName(ctx, data.nombre, CX, mm(5+2.63*10), innerW);
    var yTalla=lastName+LEADB, yColor=yTalla+LEADB;
    drawLabelValue(ctx, "Talla: ", data.talla, CX, yTalla, pt(6));
    drawLabelValue(ctx, "Color: ", data.color, CX, yColor, pt(6));
    setLS(ctx,"0px");
    // precio (DM Sans Medium Italic 7pt, tracking 50) baseline 3,96 cm
    setLS(ctx,"0.05em"); ctx.textAlign="center"; ctx.fillStyle=ORO;
    ctx.font="italic 500 "+pt(7)+"px "+FF;
    ctx.fillText(data.precio, CX, mm(5+3.96*10));
    setLS(ctx,"0px");
    // codigo de barras BLANCO sin fondo: 1,9 x 1,0 cm, arriba a 4,5 cm
    var off=document.createElement("canvas");
    JsBarcode(off, data.sku, {format:"CODE128", displayValue:false, height:150, margin:0,
      lineColor:"#ffffff", background:"#000000"});
    ctx.drawImage(off, CX-mm(19)/2, mm(5+4.5*10), mm(19), mm(10));
    // SKU (DM Sans Light 4pt, blanco) baseline 5,69 cm — solo si esta activado
    if(data.skuVis){
      ctx.fillStyle=BLANCO; ctx.textAlign="center"; setLS(ctx,"0.02em");
      ctx.font="300 "+pt(4)+"px "+FF;
      ctx.fillText(data.sku, CX, mm(5+5.69*10));
      setLS(ctx,"0px");
    }
    // marcas de corte (punteadas)
    ctx.strokeStyle=BLANCO; ctx.lineWidth=Math.max(1,mm(0.08)); ctx.setLineDash([mm(0.9),mm(0.6)]);
    var ml=mm(3.5), gp=mm(1);
    [[TL,TT,-1,-1],[TR,TT,1,-1],[TL,TB,-1,1],[TR,TB,1,1]].forEach(function(a){
      var x=a[0],y=a[1],dx=a[2],dy=a[3];
      ctx.beginPath(); ctx.moveTo(x+dx*gp,y); ctx.lineTo(x+dx*(gp+ml),y);
      ctx.moveTo(x,y+dy*gp); ctx.lineTo(x,y+dy*(gp+ml)); ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function leer(){
    return { sku:(inSku.value||"").trim().toUpperCase(),
             nombre:(inNombre.value||"").trim(),
             talla:(inTalla.value||"").trim(),
             color:(inColor.value||"").trim(),
             diseno:pad2(inDiseno.value),
             precio:fmtPrecio(inPrecio.value),
             skuVis:(inSkuVis.value==="si") };
  }
  function generar(){
    msg.textContent="";
    var d=leer();
    if(!d.sku){ msg.textContent="Falta el SKU."; return null; }
    inSku.value=d.sku;
    try{ dibujar(canvas, d); return d; }
    catch(e){ msg.textContent="Ese SKU no se puede convertir en código de barras. Usa letras, números o guiones."; return null; }
  }

  // ---- PNG con medidas exactas (chunk pHYs) ----
  var CRCT=(function(){var c,t=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
  function crc32(buf,start,len){ var c=0xFFFFFFFF; for(var i=0;i<len;i++) c=CRCT[(c^buf[start+i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
  function pngConDPI(dataURL){
    var bin=atob(dataURL.split(",")[1]), n=bin.length, png=new Uint8Array(n);
    for(var i=0;i<n;i++) png[i]=bin.charCodeAt(i);
    var phys=new Uint8Array(21); var dv=new DataView(phys.buffer);
    dv.setUint32(0,9);
    phys[4]=0x70;phys[5]=0x48;phys[6]=0x59;phys[7]=0x73;   // 'pHYs'
    dv.setUint32(8,PPU); dv.setUint32(12,PPU); phys[16]=1; // ppuX, ppuY, unidad=metro
    dv.setUint32(17, crc32(phys,4,13));
    var out=new Uint8Array(png.length+21);
    out.set(png.subarray(0,33),0); out.set(phys,33); out.set(png.subarray(33),54);
    return new Blob([out],{type:"image/png"});
  }

  $("btnGen").addEventListener("click", generar);
  $("btnPng").addEventListener("click",function(){
    var d=generar(); if(!d) return;
    var blob=pngConDPI(canvas.toDataURL("image/png"));
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download="Tirilla_"+d.sku+".png"; a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1500);
  });
  $("btnPrint").addEventListener("click",function(){
    var d=generar(); if(!d) return;
    var n=Math.max(1, Math.min(60, parseInt(inCopias.value||"1",10)));
    var url=canvas.toDataURL("image/png");
    var area=$("printArea"); area.innerHTML="";
    for(var i=0;i<n;i++){ var img=new Image(); img.src=url; area.appendChild(img); }
    setTimeout(function(){ window.print(); }, 200);
  });

  // Inicial (esperar a DM Sans si esta disponible)
  currentBase="CC"; buildSku(); generar();
  try{
    if(document.fonts && document.fonts.load){
      Promise.all([
        document.fonts.load('900 30px "DM Sans"'),
        document.fonts.load('300 30px "DM Sans"'),
        document.fonts.load('italic 500 30px "DM Sans"')
      ]).then(function(){ generar(); }, function(){});
      if(document.fonts.ready){ document.fonts.ready.then(function(){ generar(); }); }
    }
  }catch(e){}
})();
