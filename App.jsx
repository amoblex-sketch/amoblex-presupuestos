import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

/* ═══ SUPABASE CONNECTION ═══ */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const cache = {};
async function sGet(key, fallback) {
  if (cache[key] !== undefined) return cache[key];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('app_data').select('value').eq('key', key).single();
      if (!error && data) { cache[key] = data.value; return data.value ?? fallback; }
    } catch (e) { console.error('sGet:', e); }
  }
  try { const local = localStorage.getItem('amoblex_' + key); if (local) return JSON.parse(local); } catch (e) {}
  return fallback;
}
async function sSet(key, value) {
  cache[key] = value;
  try { localStorage.setItem('amoblex_' + key, JSON.stringify(value)); } catch (e) {}
  if (supabase) {
    try { await supabase.from('app_data').upsert({ key, value }, { onConflict: 'key' }); } catch (e) { console.error('sSet:', e); }
  }
}
function clearCache() { Object.keys(cache).forEach(k => delete cache[k]); }


/* ═══════════════════════════════════════════════════════
   1. DATA — MÓDULOS
   ═══════════════════════════════════════════════════════ */

const MODS_BM = [
  { id:"bm1", cat:"bm", nombre:"Esquinero 1P Paño Fijo", anchos:[1000,1100,1200], puertas:1, cajones:0, estantes:1, travesanos:2, bases:1, tipo:"esq1p" },
  { id:"bm2", cat:"bm", nombre:"Esquinero 2P Paño Fijo", anchos:[1400,1500,1600,1700,1800], puertas:2, cajones:0, estantes:1, travesanos:2, bases:1, tipo:"esq2p" },
  { id:"bm3", cat:"bm", nombre:"Bajo Mesada 2P", anchos:[500,600,700,800,900,1000,1100,1200], puertas:2, cajones:0, estantes:1, travesanos:2, bases:1, tipo:"bm2p" },
  { id:"bm4", cat:"bm", nombre:"Cajonera 3 Cajones", anchos:[400,500,600,700,800,900,1000,1100,1200], puertas:0, cajones:3, estantes:0, travesanos:2, bases:1, tipo:"caj3" },
  { id:"bm5", cat:"bm", nombre:"Cajonera 2 Cajones", anchos:[400,500,600,700,800,900,1000,1100,1200], puertas:0, cajones:2, estantes:0, travesanos:2, bases:1, tipo:"caj2" },
  { id:"bm6", cat:"bm", nombre:"Esquinero Completo 2P", anchos:[1000,1100,1200], puertas:2, cajones:0, estantes:2, travesanos:4, bases:2, tipo:"esqcomp" },
  { id:"bm7", cat:"bm", nombre:"Bajo Mesada 1P", anchos:[200,300,400,500,600], puertas:1, cajones:0, estantes:1, travesanos:2, bases:1, tipo:"bm1p" },
  { id:"bm8", cat:"bm", nombre:"Horno + 1 Cajón", anchos:[600], puertas:0, cajones:1, estantes:1, travesanos:1, bases:1, tipo:"horno" },
];

const MODS_AL = [
  { id:"al1", cat:"al", nombre:"Alacena Esq 1P Paño Fijo", anchos:[800,900,1000], puertas:1, cajones:0, estantes:1, tipo:"alesq1p" },
  { id:"al2", cat:"al", nombre:"Alacena Esq 2P Paño Fijo", anchos:[800,900,1000,1100,1200,1300,1400], puertas:2, cajones:0, estantes:1, tipo:"alesq2p" },
  { id:"al3", cat:"al", nombre:"Alacena 2P Lateral", anchos:[800,900,1000,1100,1200], puertas:2, cajones:0, estantes:1, tipo:"al2p" },
  { id:"al4", cat:"al", nombre:"Alacena 1P Lateral", anchos:[300,400,500,600], puertas:1, cajones:0, estantes:1, tipo:"al1p" },
  { id:"al5", cat:"al", nombre:"Alacena 1P Basculante", anchos:[500,600,700,800,900,1000], puertas:1, cajones:0, estantes:1, tipo:"albasc1p", altoVar:true },
  { id:"al6", cat:"al", nombre:"Alacena 2P Basculante", anchos:[500,600,700,800,900,1000], puertas:2, cajones:0, estantes:1, tipo:"albasc2p" },
  { id:"al7", cat:"al", nombre:"Alacena Vinoteca", anchos:[150], puertas:0, cajones:0, estantes:0, tipo:"vinoteca" },
  { id:"al8", cat:"al", nombre:"Microondas + 1P Basc", anchos:[600], puertas:1, cajones:0, estantes:1, tipo:"micro1p" },
  { id:"al9", cat:"al", nombre:"Microondas + 2P", anchos:[600], puertas:2, cajones:0, estantes:1, tipo:"micro2p" },
];

const MODS_DE = [
  { id:"de1", cat:"de", nombre:"Despensero 1P", anchos:[300,400,500,600], puertas:1, cajones:0, tipo:"desp1p" },
  { id:"de2", cat:"de", nombre:"Despensero 2P", anchos:[600,700,800,900,1000,1100,1200], puertas:2, cajones:0, tipo:"desp2p" },
];

const MODS_TO = [
  { id:"to1", cat:"to", nombre:"Torre 2 Caj + 1P Basc", anchos:[600], puertas:0, cajones:2, tipo:"torre1" },
  { id:"to2", cat:"to", nombre:"Torre 2P + 1P Basc", anchos:[600], puertas:2, cajones:0, tipo:"torre2" },
  { id:"to3", cat:"to", nombre:"Torre 2 Caj + 2P", anchos:[600], puertas:2, cajones:2, tipo:"torre3" },
];

const MODS_ES = [
  { id:"es1", cat:"es", nombre:"Arriba Heladera 2P", anchos:[950], puertas:2, cajones:0, estantes:2, tipo:"heladera" },
];

/* ═══ PLACARD / VESTIDOR MODULES ═══ */
const MODS_PL_INT = [
  { id:"pl1", cat:"plInt", nombre:"Módulo Estantes (4)", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:0, estantes:4, tipo:"plEst4", ambiente:"placard" },
  { id:"pl2", cat:"plInt", nombre:"Módulo Estantes (5)", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:0, estantes:5, tipo:"plEst5", ambiente:"placard" },
  { id:"pl3", cat:"plInt", nombre:"Módulo Barra Colgar", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:0, estantes:1, tipo:"plBarra1", ambiente:"placard" },
  { id:"pl4", cat:"plInt", nombre:"Módulo Barra Doble", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:0, estantes:0, tipo:"plBarra2", ambiente:"placard" },
  { id:"pl5", cat:"plInt", nombre:"Módulo Cajonera 3C + Estantes", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:3, estantes:2, tipo:"plCaj3", ambiente:"placard" },
  { id:"pl6", cat:"plInt", nombre:"Módulo Cajonera 2C + Barra", anchos:[600,700,800,900,1000,1100,1200], puertas:0, cajones:2, estantes:0, tipo:"plCaj2B", ambiente:"placard" },
  { id:"pl7", cat:"plInt", nombre:"Módulo Zapatero", anchos:[600,700,800,900,1000], puertas:0, cajones:0, estantes:6, tipo:"plZap", ambiente:"placard" },
];
const MODS_PL_EST = [
  { id:"pl8", cat:"plEst", nombre:"Esquinero Vestidor 90°", anchos:[1000,1100,1200], puertas:0, cajones:0, estantes:3, tipo:"plEsq90", ambiente:"placard" },
];
const MODS_PL_EXT = [
  { id:"pl9", cat:"plExt", nombre:"Lateral Externo (par)", anchos:[600], puertas:0, cajones:0, estantes:0, tipo:"plLatExt", ambiente:"placard" },
  { id:"pl10", cat:"plExt", nombre:"Puerta Corrediza", anchos:[600,700,800,900,1000,1100,1200], puertas:1, cajones:0, estantes:0, tipo:"plPuerta", ambiente:"placard" },
];

const ALL_MODS = [...MODS_BM, ...MODS_AL, ...MODS_DE, ...MODS_TO, ...MODS_ES, ...MODS_PL_INT, ...MODS_PL_EST, ...MODS_PL_EXT];
const CATS_COCINA = [
  { id:"bm", nombre:"Bajo Mesada", mods:MODS_BM, icon:"🗄️" },
  { id:"al", nombre:"Alacenas", mods:MODS_AL, icon:"🔲" },
  { id:"de", nombre:"Despenseros", mods:MODS_DE, icon:"🚪" },
  { id:"to", nombre:"Torres", mods:MODS_TO, icon:"🏗️" },
  { id:"es", nombre:"Especiales", mods:MODS_ES, icon:"❄️" },
];
const CATS_PLACARD = [
  { id:"plInt", nombre:"Interior Placard", mods:MODS_PL_INT, icon:"👔" },
  { id:"plEst", nombre:"Esquineros", mods:MODS_PL_EST, icon:"⌐" },
  { id:"plExt", nombre:"Estructura / Puertas", mods:MODS_PL_EXT, icon:"🚪" },
];
const CATS = [...CATS_COCINA, ...CATS_PLACARD];
// Filter categories by ambiente
const getCats = (ambiente) => {
  if(ambiente==="placard"||ambiente==="vestidor") return CATS_PLACARD;
  return CATS_COCINA; // cocina, vanitory, lavadero, etc → use cocina modules
};

const ALTOS_BASC = [300,350,400,450,500];
const RENTS = [20,30,40,50,60,70,80,90,100,110,120];

/* ═══════════════════════════════════════════════════════
   2. DEFAULT VALUES
   ═══════════════════════════════════════════════════════ */

const defPrecios = {
  // Placas $/m²
  placaAgloBlanco:84276, placaAgloColor:101939, placaMdfBlanco:102813.63, placaMdfColor:121449.50, placaGloss:491400, placaFibroBlanco:31479.13, placaFibroColor:54805.07,
  // Cantos $/ml
  cantoBlanco04:225.72, cantoColor04:725.76, cantoBlanco2:1246.32, cantoColor2:2089.80, cantoGloss1:3845.04,
  // Herrajes
  bisagraComun:1790.49, bisagraCierreSuave:5376.01, expulsorPush:8453.97,
  tornillo16:33, tornillo32:38.57, tornillo48:37.38, tornillo60:60,
  // Tornillo boxes (for Orden de Compra)
  cajaTorn16x200:6442, cajaTorn16x600:11876,
  cajaTorn32x200:8328, cajaTorn32x600:23145,
  cajaTorn48x300:11214,
  cajaTorn60x100:12629,
  // Auto-calc materials
  embalajeFilm:15822, lijaEsponja:3848,
  // Correderas Telescópica Común (Grupo Euro)
  correderaComun30:9430, correderaComun35:10146, correderaComun40:11493, correderaComun45:12838, correderaComun:14877,
  // Correderas Cierre Suave (Grupo Euro)
  correderaCS30:17265, correderaCS35:20665, correderaCS40:20665, correderaCS45:22360, correderaCS:25781, correderaCS55:25781,
  // Correderas Push (Grupo Euro)
  correderaPush30:15060, correderaPush35:15060, correderaPush45:20547, correderaPush:22377, correderaPush55:22377,
  // Correderas Angosta (Grupo Euro)
  correderaAng30:5455, correderaAng35:6276, correderaAng40:7235, correderaAng45:8180, correderaAng50:9112, correderaAng55:9112,
  // Matrix Box
  matrixBox450:60128, matrixBox:61021,
  setBarraLat:25000, lateralMet:21000,
  soporteEstante:31.58, minifix:255, soporteAlacena:816.82, tarugo:20,
  pataPlastica:1347.98, clipZocalo:216.71, escuadraSoporte:476.28, pasacablePVC:3396, protectorIgnifugo:85000,
  // Perfiles
  zocaloAlumMl:24000,
  perfilAlumBlanco:42865.20, perfilAlumNegro:42865.20, perfilAlumNatural:35112.55,
  perfilMedAlumBlanco:52390.80, perfilMedAlumNegro:52390.80, perfilMedAlumNatural:45901.49,
  perfilMC:50300, perfilMH:42315.10, perfilMJ:42315.10,
  perfilMedMC:50300, perfilMedMH:42315.10, perfilMedMJ:42315.10,
  perfilTop2045:51804.98, perfilSierra:68800.07, perfilInterNegro:68800.07, perfilInterAlum:68800.07,
  escuadraAlum2045:2619.54, escuadraGola:2939.84, soporteGola:3000, perfilSopEstFlot:73941.66,
  // Transporte
  precioKm:1500, direccionOrigen:"Córdoba, Argentina",
  // Tiradores
  tiradorClass70:6321.46, tiradorClass70Negro:6321.46, tiradorBarral96L:3310.15, tiradorBarral128L:4109.11,
  tiradorUdineNegro192:8070.56, tiradorUdineAlum192:10703.20, manijaBarralInox128:8096.76, manijaBergamo96:4285.33, tiradorBoton:4442.50, manijaBarralEsquel128:1582.44,
  // Pistones
  pistonSKON120:5103, pistonN100:6828, pistonFuerzaInv:12000,
  // Vidrios $/m²
  vidrioIncoloro:77966.35, vidrioBronce:167178.44, vidrioEspejado:57322.54,
  // Corte y pegado
  corteComun:571.32, corteGloss:2297.16, pegado04:672.84, pegado2:1018.44, pegadoGloss:2700,
  // Tapas
  tapaAuto50:1754,
  // LED
  ledMl:18000,
};

const defFiltros = {
  // Interior unificado
  interior:"agloBlanco", puerta:"agloBlanco", colorFondo:"blanco",
  // Cantos (blanco04, color04, blanco2, color2, gloss1)
  cantoInt:"blanco04", cantoFrontal:"blanco04", cantoPuerta:"blanco04",
  // Herrajes generales (defaults, override por módulo)
  corredera:"comun", correderaMedida:"50", colorHerraje:"aluminio", setBarraLat:false,
  bisagra:"comun", tipoPiston:"skoN120",
  // Apertura general (override por módulo)
  apertura:"melamina",
  // Alturas
  altFinAlacenas:2200,
  // Base BM
  baseBM:"banquina",
  // Placard specific
  profExt:600, profInt:500, altoPlacard:2600, banquinaPlacard:"material",
  kitPlacard:"cl200", ledPlacardLat:false, cantoPuertaPlacard:"color04",
  // Admin
  rentabilidad:30, iva:false,
};

const CATALOGO = [
  { cat:"Placas ($/m²)", items:[["placaAgloBlanco","Placa Aglo Blanco"],["placaAgloColor","Placa Aglo Color"],["placaMdfBlanco","Placa MDF Blanco"],["placaMdfColor","Placa MDF Color"],["placaGloss","Placa Gloss"],["placaFibroBlanco","Fondo Fibro Blanco"],["placaFibroColor","Fondo Fibro Color"]]},
  { cat:"Cantos ($/ml)", items:[["cantoBlanco04","Canto Blanco 0.4mm"],["cantoColor04","Canto Color 0.4mm"],["cantoBlanco2","Canto Blanco 2mm"],["cantoColor2","Canto Color 2mm"],["cantoGloss1","Canto Gloss 1mm"]]},
  { cat:"Corte y Pegado", items:[["corteComun","Corte Común"],["corteGloss","Corte Gloss"],["pegado04","Pegado 0.4mm ($/ml)"],["pegado2","Pegado 2mm ($/ml)"],["pegadoGloss","Pegado Gloss ($/ml)"]]},
  { cat:"Herrajes", items:[["bisagraComun","Bisagra Común"],["bisagraCierreSuave","Bisagra Cierre Suave"],["expulsorPush","Expulsor Push"],
    ["correderaComun30","Corr. Común 30cm"],["correderaComun35","Corr. Común 35cm"],["correderaComun40","Corr. Común 40cm"],["correderaComun45","Corr. Común 45cm"],["correderaComun","Corr. Común 50cm"],
    ["correderaCS30","Corr. CS 30cm"],["correderaCS35","Corr. CS 35cm"],["correderaCS40","Corr. CS 40cm"],["correderaCS45","Corr. CS 45cm"],["correderaCS","Corr. CS 50cm"],["correderaCS55","Corr. CS 55cm"],
    ["correderaPush30","Corr. Push 30cm"],["correderaPush35","Corr. Push 35cm"],["correderaPush45","Corr. Push 45cm"],["correderaPush","Corr. Push 50cm"],["correderaPush55","Corr. Push 55cm"],
    ["correderaAng30","Corr. Angosta 30cm"],["correderaAng35","Corr. Angosta 35cm"],["correderaAng40","Corr. Angosta 40cm"],["correderaAng45","Corr. Angosta 45cm"],["correderaAng50","Corr. Angosta 50cm"],["correderaAng55","Corr. Angosta 55cm"],
    ["matrixBox450","Matrix Box 450"],["matrixBox","Matrix Box 500"],
    ["setBarraLat","Set Barra Lateral"],["lateralMet","Lateral Metálico"],["soporteEstante","Soporte Estante"],["minifix","Minifix"],["soporteAlacena","Soporte Alacena"],["tarugo","Tarugo"],["escuadraSoporte","Escuadra Soporte"],["pasacablePVC","Pasacable PVC"],["protectorIgnifugo","Protector Ignífugo"]]},
  { cat:"Tornillos ($/u)", items:[["tornillo16","Tornillo 16mm"],["tornillo32","Tornillo 32mm"],["tornillo48","Tornillo 48mm"],["tornillo60","Tornillo 60mm"]]},
  { cat:"Tornillos (cajas)", items:[["cajaTorn16x200","Caja Torn 16mm ×200"],["cajaTorn16x600","Caja Torn 16mm ×600"],["cajaTorn32x200","Caja Torn 32mm ×200"],["cajaTorn32x600","Caja Torn 32mm ×600"],["cajaTorn48x300","Caja Torn 48mm ×300"],["cajaTorn60x100","Caja Torn 60mm ×100"]]},
  { cat:"Consumibles", items:[["embalajeFilm","Embalaje Film (×placa)"],["lijaEsponja","Lija Esponja (c/5 placas)"]]},
  { cat:"Base / Zócalo", items:[["pataPlastica","Pata Plástica"],["clipZocalo","Clip Zócalo"],["zocaloAlumMl","Zócalo Aluminio ($/ml)"]]},
  { cat:"Pistones", items:[["pistonSKON120","Pistón Hafele SKO N120"],["pistonN100","Pistón Hafele N100"],["pistonFuerzaInv","Pistón Hafele F.Inversa"]]},
  { cat:"Perfiles Gola ($/tira 3m)", items:[
    ["perfilAlumBlanco","Gola Sup. Alum. Blanco"],["perfilAlumNegro","Gola Sup. Alum. Negro"],["perfilAlumNatural","Gola Sup. Alum. Natural"],
    ["perfilMedAlumBlanco","Gola Med. Alum. Blanco"],["perfilMedAlumNegro","Gola Med. Alum. Negro"],["perfilMedAlumNatural","Gola Med. Alum. Natural"],
    ["perfilMC","Gola Sup. MC"],["perfilMH","Gola Sup. MH"],["perfilMJ","Gola Sup. MJ"],
    ["perfilMedMC","Gola Med. MC"],["perfilMedMH","Gola Med. MH"],["perfilMedMJ","Gola Med. MJ"],
    ["escuadraGola","Escuadra Gola ($/u)"],["soporteGola","Soporte Gola ($/u)"]]},
  { cat:"Tiradores ($/u)", items:[["tiradorClass70","Class 70mm"],["tiradorClass70Negro","Class 70mm Negro"],["tiradorBarral96L","Barral 96mm L"],["tiradorBarral128L","Barral 128mm L"],["tiradorUdineNegro192","Udine Negro 192"],["tiradorUdineAlum192","Udine Alum 192"],["manijaBarralInox128","Manija Barral Inox 128"],["manijaBergamo96","Manija Bergamo 96"],["tiradorBoton","Tirador Botón"],["manijaBarralEsquel128","Manija Barral Esquel 128"]]},
  { cat:"Perfiles Vidrio ($/tira 3m)", items:[["perfilTop2045","Perfil Top 20×45"],["perfilSierra","Perfil Sierra"],["perfilInterNegro","Perfil Inter Negro"],["perfilInterAlum","Perfil Inter Aluminio"],["escuadraAlum2045","Escuadra 20×45 ($/u)"]]},
  { cat:"Vidrios ($/m²)", items:[["vidrioIncoloro","Vidrio Incoloro"],["vidrioBronce","Vidrio Bronce"],["vidrioEspejado","Vidrio Espejado"]]},
  { cat:"Otros", items:[["tapaAuto50","Tapa Autoadhesiva x50"],["perfilSopEstFlot","Perfil Sop. Est. Flotante"],["ledMl","LED ($/ml)"],["precioKm","Transporte ($/km)"]]},
];

const ACCESORIOS_INIT = [
  { id:"acc1", nombre:"Canasto bajo bacha c/hueco 900", precio:260000, img:"" },
  { id:"acc1b", nombre:"Canasto bajo bacha s/hueco 900", precio:260000, img:"" },
  { id:"acc2", nombre:"Cubiertero mod 500 (44×48)", precio:15643, img:"" },
  { id:"acc2b", nombre:"Cubiertero mod 600 (54×48)", precio:18250, img:"" },
  { id:"acc2c", nombre:"Cubiertero mod 700 (64×48)", precio:20857, img:"" },
  { id:"acc2d", nombre:"Cubiertero mod 800 (73×49)", precio:20962, img:"" },
  { id:"acc2e", nombre:"Cubiertero mod 900 (84×48)", precio:23464, img:"" },
  { id:"acc2f", nombre:"Cubiertero mod 1000 (94×48)", precio:45000, img:"" },
  { id:"acc2g", nombre:"Cubiertero mod 1100 (94×48)", precio:55000, img:"" },
  { id:"acc2h", nombre:"Cubiertero mod 1200 (94×48)", precio:65000, img:"" },
  { id:"acc3", nombre:"Piso aluminio mod 600", precio:35126, img:"" },
  { id:"acc3b", nombre:"Piso aluminio mod 700", precio:39091, img:"" },
  { id:"acc3c", nombre:"Piso aluminio mod 800", precio:43057, img:"" },
  { id:"acc3d", nombre:"Piso aluminio mod 900", precio:45890, img:"" },
  { id:"acc3e", nombre:"Piso aluminio mod 1000", precio:48722, img:"" },
  { id:"acc3f", nombre:"Piso aluminio mod 1100", precio:48722, img:"" },
  { id:"acc3g", nombre:"Piso aluminio mod 1200", precio:48722, img:"" },
  { id:"acc4", nombre:"Porta residuos Fark 2001 inox cuadrado", precio:11000, img:"" },
  { id:"acc4b", nombre:"Porta residuos Fark inox redondo", precio:58000, img:"" },
  { id:"acc5", nombre:"Pantalonero extraíble", precio:91928, img:"" },
  { id:"acc6", nombre:"Calesita esquinero", precio:0, img:"" },
  { id:"acc7", nombre:"Especiero extraíble", precio:0, img:"" },
  { id:"acc8", nombre:"Caño oval cromado x 3m", precio:11431, img:"" },
  { id:"acc9", nombre:"Cerradura p/cajón 19/22mm", precio:2579, img:"" },
  { id:"acc10", nombre:"Kit placard GE52 2.00×2.00 (2 hojas)", precio:89474, img:"" },
  { id:"acc10b", nombre:"Kit placard GE52 3.00×2.00 (2 hojas)", precio:121486, img:"" },
  { id:"acc10c", nombre:"Kit placard Classic 1.50×2.60", precio:114505, img:"" },
  { id:"acc10d", nombre:"Kit placard Classic 2.00×2.60", precio:121076, img:"" },
  { id:"acc10e", nombre:"Kit placard Classic 3.00×2.60", precio:133570, img:"" },
  { id:"acc10f", nombre:"Kit placard Classic 4.00×2.60", precio:147833, img:"" },
  { id:"acc10g", nombre:"Kit placard Classic hoja adic 2.60", precio:50861, img:"" },
  { id:"acc11", nombre:"Manija oculta alacena 18mm x 3m", precio:50009, img:"" },
  { id:"acc12", nombre:"Silicona Fischer blanca 280ml", precio:6675, img:"" },
  { id:"acc12b", nombre:"Silicona Fischer transparente 280ml", precio:12732, img:"" },
];

/* ═══════════════════════════════════════════════════════
   3. CALCULATION ENGINE
   ═══════════════════════════════════════════════════════ */

// Interior helper: derives color and material from unified field
function intDeriv(interior) {
  const i = interior || "agloBlanco";
  return {
    colorInt: i.includes("Blanco") ? "blanco" : "color",
    matInt: i.startsWith("mdf") ? "mdf" : "aglomerado",
  };
}

function getAltAl(f) { return Math.max(0, (f.altFinAlacenas||2200) - 1500); }
function getLatAl(f) { return Math.max(0, getAltAl(f) - 36); }
function getAltDesp(f) { return (f.altFinAlacenas||2200) - 100; }
function getAltTorre(f) { return (f.altFinAlacenas||2200) - 100; }
function getLatDe(f) { return Math.max(0, getAltDesp(f) - 36); }
function getLatTo(f) { return Math.max(0, getAltTorre(f) - 36); }

// p = pieza helper: nombre, cant, largo, ancho, cSup, cInf, cIzq, cDer, zona
function P(n,c,l,a,s,i,iz,d,z){ return {nombre:n,cant:c,largo:+(l).toFixed(2),ancho:+(a).toFixed(2),cSup:s,cInf:i,cIzq:iz,cDer:d,zona:z}; }
function mlP(p){ return p.cant * ((p.cSup*p.largo + p.cInf*p.largo + p.cIzq*p.ancho + p.cDer*p.ancho) / 1e3); }

function getPiezas(tipo, ancho, f, extraAlto) {
  const altAl=getAltAl(f), latAl=getLatAl(f), latDe=getLatDe(f), latTo=getLatTo(f), altBasc=extraAlto||350;
  const pz = [];
  const t = tipo;

  // ══ BAJO MESADA ══
  if (t==="bm2p"||t==="bm1p") {
    const tl=ancho-36, nP=t==="bm2p"?2:1, pw=nP===2?(ancho-10)/2:ancho-7;
    pz.push(P("Base",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,ancho,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav trasero",1,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Estante",1,tl,542,1,0,0,0,"Int"));
    pz.push(P("Puerta",nP,740.5,pw,1,1,1,1,"Pta"));
  } else if (t==="caj3") {
    const tl=ancho-36,fw=ancho-7,ct=ancho-98,fc=ancho-78;
    pz.push(P("Base",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,ancho,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav trasero",1,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Frente hollero",1,352.5,fw,1,1,1,1,"Pta"));
    pz.push(P("Frente med",2,158.5,fw,1,1,1,1,"Pta"));
    pz.push(P("Contrafr hollero",1,ct,352.5,1,0,0,0,"Int"));
    pz.push(P("Contrafr med",2,ct,158.5,1,0,0,0,"Int"));
    pz.push(P("Lat caj hollero",2,500,352.5,1,0,0,0,"Int"));
    pz.push(P("Lat caj med",4,500,158.5,1,0,0,0,"Int"));
    pz.push(P("Fondo caj fibro",3,fc,484,0,0,0,0,"Fondo"));
  } else if (t==="caj2") {
    const tl=ancho-36,fw=ancho-7,ct=ancho-98,fc=ancho-78;
    pz.push(P("Base",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,ancho,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav trasero",1,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Frente cajón",2,352.5,fw,1,1,1,1,"Pta"));
    pz.push(P("Contrafr",2,ct,352.5,1,0,0,0,"Int"));
    pz.push(P("Lat cajón",4,500,352.5,1,0,0,0,"Int"));
    pz.push(P("Fondo caj fibro",2,fc,484,0,0,0,0,"Fondo"));
  } else if (t==="esq1p") {
    const tl=ancho-36, pw=ancho-630-8, pn=ancho-pw-7;
    pz.push(P("Base",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,ancho,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav trasero",1,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Estante",1,tl,542,1,0,0,0,"Int"));
    pz.push(P("Puerta",1,740.5,pw,1,1,1,1,"Pta"));
    pz.push(P("Paño fijo",1,780,pn,1,0,1,0,"Int"));
    pz.push(P("Espaciador",1,780,60,1,1,0,0,"Int"));
    pz.push(P("Bisagra int",1,744,60,0,0,0,0,"Int"));
  } else if (t==="esq2p") {
    const tl=ancho-36, pw=(ancho-630-11)/2;
    pz.push(P("Base",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,ancho,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav trasero",1,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Estante",1,tl,542,1,0,0,0,"Int"));
    pz.push(P("Puerta",2,740.5,pw,1,1,1,1,"Pta"));
    pz.push(P("Paño fijo",1,780,630,1,0,1,0,"Int"));
    pz.push(P("Espaciador",1,780,60,1,1,0,0,"Int"));
    pz.push(P("Bisagra int",1,744,60,0,0,0,0,"Int"));
  } else if (t==="esqcomp") {
    const bB=ancho-562,eA=ancho-18,pAw=ancho-562-7,pBw=bB-18-7,tl=ancho-36;
    pz.push(P("Base A",1,ancho,562,1,0,0,0,"Int"));
    pz.push(P("Base B",1,bB,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo A fibro",1,ancho-62,780,0,0,0,0,"Fondo"));
    pz.push(P("Fondo B fibro",1,ancho-62,780,0,0,0,0,"Fondo"));
    pz.push(P("Estante A",1,eA,542,1,0,0,0,"Int"));
    pz.push(P("Estante B",1,bB,542,1,0,0,0,"Int"));
    pz.push(P("Trav tras",2,tl,60,1,1,0,0,"Int"));
    pz.push(P("Trav front",2,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Trav vert 1",1,62,762,1,0,0,0,"Int"));
    pz.push(P("Trav vert 2",1,80,762,1,0,0,0,"Int"));
    pz.push(P("Puerta A",1,740.5,pAw,1,1,1,1,"Pta"));
    pz.push(P("Puerta B",1,740.5,pBw,1,1,1,1,"Pta"));
  } else if (t==="horno") {
    const tl=564,fw=593,ct=502,fc=522;
    pz.push(P("Base",1,600,562,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,762,562,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro 3mm",1,600,780,0,0,0,0,"Fondo"));
    pz.push(P("Trav frontal",1,tl,60,1,1,0,0,"TravF"));
    pz.push(P("Estante",1,tl,542,1,0,0,0,"Int"));
    pz.push(P("Pieza horno",1,tl,108,1,1,0,0,"Int"));
    pz.push(P("Frente cajón",1,133,fw,1,1,1,1,"Pta"));
    pz.push(P("Contrafr",1,ct,133,1,0,0,0,"Int"));
    pz.push(P("Lat cajón",2,500,133,1,0,0,0,"Int"));
    pz.push(P("Fondo caj fibro",1,fc,484,0,0,0,0,"Fondo"));
  }
  // ══ ALACENAS ══
  else if (t==="al2p") {
    const pw=(ancho-10)/2;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta",2,altAl+14,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,312,1,0,0,0,"Int"));
  } else if (t==="al1p") {
    const pw=ancho-6;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta",1,altAl+14,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,312,1,0,0,0,"Int"));
  } else if (t==="alesq1p") {
    const pw=ancho-387;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta",1,altAl+14,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,250,1,0,0,0,"Int"));
    pz.push(P("Paño fijo",1,altAl,380,1,0,1,0,"Int"));
    pz.push(P("Espaciador",1,altAl,50,1,1,0,0,"Int"));
    pz.push(P("Bisagra int",1,latAl,50,0,0,0,0,"Int"));
  } else if (t==="alesq2p") {
    const pw=(ancho-388)/2;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta",2,altAl+14,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,250,1,0,0,0,"Int"));
    pz.push(P("Paño fijo",1,altAl,380,1,0,1,0,"Int"));
    pz.push(P("Espaciador",1,altAl,50,1,1,0,0,"Int"));
    pz.push(P("Bisagra int",1,latAl,50,0,0,0,0,"Int"));
  } else if (t==="albasc1p") {
    const lb=altBasc-36,pw=ancho-5,ph=altBasc-9;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,lb,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altBasc,0,0,0,0,"Fondo"));
    pz.push(P("Puerta basc",1,ph,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,312,1,0,0,0,"Int"));
  } else if (t==="albasc2p") {
    const ph=(altAl/2)-11,pw=ancho-5;
    pz.push(P("Techo",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta basc",2,ph,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,ancho-36,332,1,0,0,0,"Int"));
  } else if (t==="vinoteca") {
    const nE=Math.floor(latAl/120);
    pz.push(P("Techo",1,150,350,1,0,0,0,"Int"));
    pz.push(P("Base",1,150,350,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,350,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,150,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Estante",nE,114,350,1,0,0,0,"Int"));
  } else if (t==="micro1p") {
    pz.push(P("Base (prof 450)",1,600,450,1,0,1,1,"Int"));
    pz.push(P("Techo",1,600,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,600,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta basc",1,292,595.84,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,564,332,1,0,0,0,"Int"));
  } else if (t==="micro2p") {
    pz.push(P("Base (prof 450)",1,600,450,1,0,1,1,"Int"));
    pz.push(P("Techo",1,600,332,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latAl,332,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,600,altAl,0,0,0,0,"Fondo"));
    pz.push(P("Puerta",2,292,295.7,1,1,1,1,"Pta"));
    pz.push(P("Estante",1,564,332,1,0,0,0,"Int"));
  }
  // ══ DESPENSEROS ══
  else if (t==="desp1p") {
    const nE=Math.floor(latDe/350),pw=ancho-4.9,ph=latDe+29;
    pz.push(P("Techo",1,ancho,600,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,600,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latDe,600,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,ancho,getAltDesp(f),0,0,0,0,"Fondo"));
    pz.push(P("Puerta",1,ph,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",nE,ancho-36,580,1,0,0,0,"Int"));
  } else if (t==="desp2p") {
    const nE=Math.floor(latDe/350),pw=(ancho-9.6)/2,ph=latDe+29;
    pz.push(P("Techo",1,ancho,600,1,0,0,0,"Int"));
    pz.push(P("Base",1,ancho,600,1,0,0,0,"Int"));
    pz.push(P("Lateral",2,latDe,600,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,getAltDesp(f),ancho,1,0,0,0,"Fondo"));
    pz.push(P("Puerta",2,ph,pw,1,1,1,1,"Pta"));
    pz.push(P("Estante",nE,ancho-36,580,1,0,0,0,"Int"));
  }
  // ══ TORRES ══
  else if (t==="torre1") {
    pz.push(P("Base",2,600,600,1,0,1,1,"Int"));
    pz.push(P("Lateral",2,latTo,600,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,getAltTorre(f),595,0,0,0,0,"Fondo"));
    pz.push(P("Travesaño",2,564,60,1,1,0,0,"Int"));
    pz.push(P("Frente cajón",2,352.55,593.1,1,1,1,1,"Pta"));
    pz.push(P("Lat cajón",4,500,302.55,1,0,0,0,"Int"));
    pz.push(P("Contrafr cajón",4,500,302.55,1,0,0,0,"Int"));
    pz.push(P("Fondo caj fibro",2,520,484,0,0,0,0,"Fondo"));
    pz.push(P("Estante 1",1,564,600,1,0,0,0,"Int"));
    pz.push(P("Estante 2",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Estante 3",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Fondo arr micro 18mm",1,297,563,0,0,0,0,"Int"));
    pz.push(P("Fondo micro 18mm",1,349,563,0,0,0,0,"Int"));
    pz.push(P("Puerta basc",1,294.55,593.1,1,1,1,1,"Pta"));
  } else if (t==="torre2") {
    pz.push(P("Base",2,600,600,1,0,1,1,"Int"));
    pz.push(P("Lateral",2,latTo,600,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,getAltTorre(f),595,0,0,0,0,"Fondo"));
    pz.push(P("Travesaño",2,564,60,1,1,0,0,"Int"));
    pz.push(P("Puerta",2,740.5,295.5,1,1,1,1,"Pta"));
    pz.push(P("Estante 0",1,564,580,1,0,0,0,"Int"));
    pz.push(P("Estante 1",1,564,600,1,0,0,0,"Int"));
    pz.push(P("Estante 2",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Estante 3",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Fondo arr micro 18mm",1,297,563,0,0,0,0,"Int"));
    pz.push(P("Fondo micro 18mm",1,349,563,0,0,0,0,"Int"));
    pz.push(P("Puerta basc",1,294.5,595,1,1,1,1,"Pta"));
  } else if (t==="torre3") {
    pz.push(P("Base",2,600,600,1,0,1,1,"Int"));
    pz.push(P("Lateral",2,latTo,600,1,0,0,0,"Int"));
    pz.push(P("Fondo fibro",1,getAltTorre(f),595,0,0,0,0,"Fondo"));
    pz.push(P("Travesaño",2,564,60,1,1,0,0,"Int"));
    pz.push(P("Frente cajón",2,352.55,593.1,1,1,1,1,"Pta"));
    pz.push(P("Lat cajón",4,500,302.55,1,0,0,0,"Int"));
    pz.push(P("Contrafr cajón",4,500,302.55,1,0,0,0,"Int"));
    pz.push(P("Fondo caj fibro",2,520,484,0,0,0,0,"Fondo"));
    pz.push(P("Estante 1",1,564,600,1,0,0,0,"Int"));
    pz.push(P("Estante 2",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Estante 3",1,564,429,1,0,0,0,"Int"));
    pz.push(P("Fondo arr micro 18mm",1,297,563,0,0,0,0,"Int"));
    pz.push(P("Fondo micro 18mm",1,349,563,0,0,0,0,"Int"));
    pz.push(P("Puerta",2,294.55,295.5,1,1,1,1,"Pta"));
  }
  // ══ ARRIBA HELADERA ══
  else if (t==="heladera") {
    pz.push(P("Techo",1,950,600,1,0,0,0,"Int"));
    pz.push(P("Base",1,950,600,1,0,0,0,"Int"));
    pz.push(P("Lat corto izq",1,264,600,1,0,0,0,"Int"));
    pz.push(P("Lat corto der",1,264,600,1,0,0,0,"Int"));
    pz.push(P("Lat largo",2,(f.altFinAlacenas||2200),623,1,0,1,1,"Int"));
    pz.push(P("Fondo fibro",1,300,950,1,0,0,0,"Fondo"));
    pz.push(P("Puerta",2,293.2,470.2,1,1,1,1,"Pta"));
    pz.push(P("Estante",2,914,580,1,0,0,0,"Int"));
  }
  return pz;
}

// Canto price lookup
const CANTO_PRICE = {
  blanco04:"cantoBlanco04", color04:"cantoColor04", blanco2:"cantoBlanco2", color2:"cantoColor2", gloss1:"cantoGloss1"
};
function cantoP(pr, key) { return pr[CANTO_PRICE[key||"blanco04"]] || pr.cantoBlanco04; }
// Canto → pegado mapping
function cantoPeg(key) { return (key||"").includes("2")?"2":(key||"").includes("gloss")?"gloss":"04"; }

function calcModuloCosto(modDef, ancho, filtros, precios, extraAlto, modOverrides) {
  const f = filtros, t = modDef.tipo;
  const pr = new Proxy(precios||{}, { get: (o,k) => typeof o[k]==="number" ? o[k] : (parseFloat(o[k])||0) });
  const ov = modOverrides || {};
  // Per-module overrides for placas/cantos (personalizable)
  const fInt = ov.interior || f.interior || "agloBlanco";
  const fPta = ov.puerta || f.puerta || "agloBlanco";
  const fFondo = ov.colorFondo || f.colorFondo || "blanco";
  const fCantoInt = ov.cantoInt || f.cantoInt || "blanco04";
  const fCantoFront = ov.cantoFrontal || f.cantoFrontal || "blanco04";
  const fCantoPta = ov.cantoPuerta || f.cantoPuerta || "blanco04";
  const esGloss = fPta === "gloss";

  // ── Placa prices ──
  let pCuerpo, pPuerta;
  const placaMap = {agloBlanco:pr.placaAgloBlanco, agloColor:pr.placaAgloColor, mdfBlanco:pr.placaMdfBlanco, mdfColor:pr.placaMdfColor, gloss:pr.placaGloss};
  pCuerpo = placaMap[fInt] || pr.placaAgloBlanco;
  pPuerta = esGloss ? pr.placaGloss : (placaMap[fPta] || pCuerpo);
  const pFibro = fFondo==="blanco"?pr.placaFibroBlanco:pr.placaFibroColor;

  // ── Canto prices ──
  const cInt = cantoP(pr, fCantoInt);
  const cTravF = cantoP(pr, fCantoFront);
  const cPuerta = esGloss ? pr.cantoGloss1 : cantoP(pr, fCantoPta);

  // ── Build pieces ──
  const piezas = getPiezas(t, ancho, f, extraAlto);

  // ── Derive totals from pieces ──
  // Apertura type needed for TravF handling (Gola Madera → TravF goes on puerta placa)
  const mAp = ov.apertura || f.apertura || "melamina";
  const esGolaMadera = mAp === "golaMadera";
  let m2cuerpo=0, m2puerta=0, m2travF=0, m2fibro=0, mlIntFront=0, mlIntBack=0, mlPuerta=0, mlTravFront=0, mlTravBack=0;
  let pzCuerpo=0, pzFrente=0;
  const esColorPuerta = fPta.includes("Color");
  // Gola Madera: TravF siempre va en placa puerta
  const travFenPuerta = esColorPuerta || esGolaMadera;
  piezas.forEach(p => {
    const area = p.cant * p.largo * p.ancho / 1e6;
    const ml = mlP(p);
    if (p.zona==="Fondo") { m2fibro += area; }
    else if (p.zona==="Pta") { m2puerta += area; mlPuerta += ml; pzFrente += p.cant; }
    else if (p.zona==="TravF") {
      m2travF += area;
      // TravF cantos: cSup = front (visible, color), cInf = back (blanco)
      const mlFront = p.cant * p.cSup * p.largo / 1e3;
      const mlBack = p.cant * p.cInf * p.largo / 1e3;
      mlTravFront += mlFront;
      mlTravBack += mlBack;
      pzCuerpo += p.cant;
    }
    else {
      m2cuerpo += area;
      // Only Base, Lateral, Techo have visible front edge → cantoFrontal on cSup
      const esFrenteVisible = /^(Base|Lateral|Techo|Paño fijo|Espaciador)/.test(p.nombre);
      if(esFrenteVisible) {
        mlIntFront += p.cant * p.cSup * p.largo / 1e3;
        mlIntBack += p.cant * (p.cInf * p.largo + p.cIzq * p.ancho + p.cDer * p.ancho) / 1e3;
      } else {
        // Estantes, trav traseros, contrafrentes, etc. → todo cantoInt
        mlIntBack += p.cant * (p.cSup * p.largo + p.cInf * p.largo + p.cIzq * p.ancho + p.cDer * p.ancho) / 1e3;
      }
      pzCuerpo += p.cant;
    }
  });

  // Hardware counts
  let nBisagras=0,nCorrederas=0,nEstantes=0,nTravesanos=0,nBases=0,nMinifix=0,nPistones=0,nProtIgn=0,nPasacable=0;
  const altAl=getAltAl(f),latDe=getLatDe(f);
  if(t==="bm2p"){nBisagras=4;nEstantes=1;nTravesanos=2;nBases=1;}
  else if(t==="bm1p"){nBisagras=2;nEstantes=1;nTravesanos=2;nBases=1;}
  else if(t==="caj3"){nCorrederas=3;nTravesanos=2;nBases=1;}
  else if(t==="caj2"){nCorrederas=2;nTravesanos=2;nBases=1;}
  else if(t==="esq1p"){nBisagras=2;nEstantes=1;nTravesanos=2;nBases=1;}
  else if(t==="esq2p"){nBisagras=4;nEstantes=1;nTravesanos=2;nBases=1;}
  else if(t==="esqcomp"){nBisagras=4;nEstantes=2;nTravesanos=4;nBases=2;nMinifix=4;}
  else if(t==="horno"){nCorrederas=1;nEstantes=1;nTravesanos=1;nBases=1;nProtIgn=4;}
  else if(t==="al2p"){nBisagras=4;nEstantes=1;}
  else if(t==="al1p"){nBisagras=2;nEstantes=1;}
  else if(t==="alesq1p"){nBisagras=2;nEstantes=1;}
  else if(t==="alesq2p"){nBisagras=4;nEstantes=1;}
  else if(t==="albasc1p"){nBisagras=2;nPistones=2;nEstantes=1;}
  else if(t==="albasc2p"){nBisagras=4;nPistones=4;nEstantes=1;}
  else if(t==="vinoteca"){nEstantes=Math.floor(getLatAl(f)/120);}
  else if(t==="micro1p"){nBisagras=2;nPistones=2;nEstantes=1;}
  else if(t==="micro2p"){nBisagras=4;nEstantes=1;}
  else if(t==="desp1p"){const ph=latDe+29;nBisagras=ph>1800?5:2;nEstantes=Math.floor(latDe/350);}
  else if(t==="desp2p"){const ph=latDe+29;nBisagras=ph>1800?10:4;nEstantes=Math.floor(latDe/350);}
  else if(t==="torre1"){nCorrederas=2;nBisagras=2;nPistones=2;nPasacable=1;nEstantes=3;nTravesanos=2;nBases=2;}
  else if(t==="torre2"){nBisagras=6;nPistones=2;nPasacable=1;nEstantes=4;nTravesanos=2;nBases=2;}
  else if(t==="torre3"){nCorrederas=2;nBisagras=4;nPasacable=1;nEstantes=3;nTravesanos=2;nBases=2;}
  else if(t==="heladera"){nBisagras=4;nEstantes=2;}

  // ── Cost calculations (per-module overrides) ──
  const mBis = ov.bisagra || f.bisagra || "comun";
  const mCorr = ov.corredera || f.corredera || "comun";
  const mCorrMed = ov.correderaMedida || f.correderaMedida || "50";
  const mPist = ov.piston || f.tipoPiston || "skoN120";

  // Corredera price by type+size
  const corrPriceLookup = (tipo, med, pr_) => {
    const sz = med==="50"?"":med; // 50cm = default key (no suffix)
    if(tipo==="lateral") return pr_.lateralMet;
    if(tipo==="matrix") return med==="45"?(pr_.matrixBox450||pr_.matrixBox):pr_.matrixBox;
    const prefix = tipo==="cierreSuave"?"correderaCS":tipo==="push"?"correderaPush":"correderaComun";
    return pr_[prefix+sz] || pr_[prefix] || pr_.correderaComun;
  };

  let costoExtra = (t==="heladera") ? 2*(f.altFinAlacenas||2200)*623/1e6*pCuerpo : 0;
  const pTravF = travFenPuerta ? pPuerta : pCuerpo;
  const costoPlacas = m2cuerpo*pCuerpo + m2puerta*pPuerta + m2travF*pTravF + m2fibro*pFibro + costoExtra;
  const costoCantos = (mlIntFront*cTravF + mlIntBack*cInt + mlPuerta*cPuerta + mlTravFront*cTravF + mlTravBack*cInt) * 1.30;

  const pBis = mBis==="comun"?pr.bisagraComun:pr.bisagraCierreSuave;
  let pCorr = t==="horno" ? pr.correderaPush : corrPriceLookup(mCorr, mCorrMed, pr);
  const pPiston=mPist==="skoN120"?pr.pistonSKON120:mPist==="n100"?pr.pistonN100:pr.pistonFuerzaInv;

  let costoHerr=nBisagras*pBis+nCorrederas*pCorr+nPistones*pPiston+nProtIgn*pr.protectorIgnifugo+nPasacable*pr.pasacablePVC+nEstantes*4*pr.soporteEstante+nMinifix*pr.minifix;
  const t16=nBisagras*4+nCorrederas*8, t32=nTravesanos*4, t48=nBases*6+(modDef.cajones||0)*8;
  costoHerr+=t16*pr.tornillo16+t32*pr.tornillo32+t48*pr.tornillo48;
  if(mCorr==="matrix"&&f.setBarraLat&&nCorrederas>0)costoHerr+=nCorrederas*pr.setBarraLat;
  if(modDef.cat==="al"&&mBis==="push"&&modDef.puertas>0)costoHerr+=modDef.puertas*2*pr.expulsorPush;
  if(modDef.cat==="al")costoHerr+=2*pr.soporteAlacena+2*pr.tarugo+2*pr.tornillo60+8*pr.tornillo16;

  const cortesC=esGloss?pzCuerpo:pzCuerpo+pzFrente, cortesG=esGloss?pzFrente:0;
  const costoCorte=(cortesC*pr.corteComun+cortesG*pr.corteGloss) * 1.25;
  // Pegado: each zone/edge uses its own canto type
  const pegInt_ = cantoPeg(fCantoInt), pegFront_ = cantoPeg(fCantoFront), pegPta_ = esGloss?"gloss":cantoPeg(fCantoPta);
  let costoPegado = 0;
  const pegPrices = {"04":pr.pegado04||0, "2":pr.pegado2||0, "gloss":pr.pegadoGloss||0};
  costoPegado += mlIntFront * (pegPrices[pegFront_]||pr.pegado04||0);
  costoPegado += mlIntBack * (pegPrices[pegInt_]||pr.pegado04||0);
  costoPegado += mlTravFront * (pegPrices[pegFront_]||pr.pegado04||0);
  costoPegado += mlTravBack * (pegPrices[pegInt_]||pr.pegado04||0);
  costoPegado += mlPuerta * (pegPrices[pegPta_]||pr.pegado04||0);

  let costoPatas=0;
  if(f.baseBM==="patas"&&(modDef.cat==="bm"||modDef.cat==="de"||modDef.cat==="to"))
    costoPatas=4*pr.pataPlastica+16*pr.tornillo16+pr.clipZocalo+(ancho/1000)*pr.zocaloAlumMl;

  // ── Vidrio (per-module override) ──
  let costoVidrio=0;
  if(modDef.cat==="al" && ov.vidrio) {
    const pVidrio = ov.vidrio==="bronce"?pr.vidrioBronce:ov.vidrio==="espejado"?pr.vidrioEspejado:pr.vidrioIncoloro;
    const perfV = ov.perfilVidrio || "top2045";
    const pPerfil = perfV==="sierra"?pr.perfilSierra:perfV==="interNegro"?pr.perfilInterNegro:perfV==="interAlum"?pr.perfilInterAlum:pr.perfilTop2045;
    const ptaPiezas = piezas.filter(p=>p.zona==="Pta");
    // Collect individual profile cuts per door
    const profCuts = [];
    ptaPiezas.forEach(p => {
      const vL = Math.max(0, p.largo - 80), vA = Math.max(0, p.ancho - 80);
      costoVidrio += p.cant * vL * vA / 1e6 * pVidrio; // glass area cost
      // Each door: 2 largos + 2 anchos of profile
      profCuts.push({len:vL, cant:p.cant*2, label:"L"+vL});
      profCuts.push({len:vA, cant:p.cant*2, label:"A"+vA});
    });
    // Optimize into 3m bars
    const barResult = barPack1D(profCuts);
    costoVidrio += barResult.totalBars * pPerfil; // price per 3m bar
    if(perfV==="top2045") costoVidrio += 4 * pr.escuadraAlum2045;
  }

  // ── Apertura: tiradores y perfiles gola (per-module override) ──
  let costoApertura=0;
  const nPtas = modDef.puertas || 0;
  const nCaj = modDef.cajones || 0;
  const nFrente = nPtas + nCaj;
  if(nFrente > 0) {
    // Gola Superior price map (puertas + 1er cajón)
    const golaSup = {alumBlanco:pr.perfilAlumBlanco, alumNegro:pr.perfilAlumNegro, alumNatural:pr.perfilAlumNatural,
      perfilMC:pr.perfilMC, perfilMH:pr.perfilMH, perfilMJ:pr.perfilMJ};
    // Gola Medio price map (1 por cada cajón)
    const golaMed = {alumBlanco:pr.perfilMedAlumBlanco, alumNegro:pr.perfilMedAlumNegro, alumNatural:pr.perfilMedAlumNatural,
      perfilMC:pr.perfilMedMC, perfilMH:pr.perfilMedMH, perfilMJ:pr.perfilMedMJ};
    const isGola = !!golaSup[mAp];
    const isGolaAlum = ["alumBlanco","alumNegro","alumNatural"].includes(mAp);
    // Tiradores: precio por unidad
    const tir = {class70:pr.tiradorClass70, class70negro:pr.tiradorClass70Negro,
      barral96L:pr.tiradorBarral96L, barral128L:pr.tiradorBarral128L,
      udineNegro192:pr.tiradorUdineNegro192, udineAlum192:pr.tiradorUdineAlum192,
      manijaBarralInox128:pr.manijaBarralInox128, manijaBergamo96:pr.manijaBergamo96, tiradorBoton:pr.tiradorBoton, manijaBarralEsquel128:pr.manijaBarralEsquel128};

    if(isGola) {
      const golaAncho = ancho; // ancho completo del módulo
      // Gola Superior: siempre 1 solo perfil del ancho del módulo
      const supCuts = [{len:golaAncho, cant:1, label:"Sup"}];
      const supResult = barPack1D(supCuts);
      costoApertura += supResult.totalBars * golaSup[mAp];
      // Gola Medio: solo 1 si hay 2+ cajones (va entre cajones)
      if(nCaj >= 2) {
        const medCuts = [{len:golaAncho, cant:1, label:"CajMed"}];
        const medResult = barPack1D(medCuts);
        costoApertura += medResult.totalBars * golaMed[mAp];
      }
      // Gola Aluminio: +2 escuadras gola por módulo
      if(isGolaAlum) costoApertura += 2 * (pr.escuadraGola || 0);
    } else if(tir[mAp]) {
      costoApertura = nFrente * tir[mAp];
    }
    // golaMadera → 2 soportes gola por bajo mesada
    if(mAp==="golaMadera" && modDef.cat==="bm") costoApertura += 2 * (pr.soporteGola || 0);
    // melamina, push → sin costo apertura extra
  }

  const total=(costoPlacas||0)+(costoCantos||0)+(costoHerr||0)+(costoCorte||0)+(costoPegado||0)+(costoPatas||0)+(costoVidrio||0)+(costoApertura||0);
  return { piezas, costoPlacas:costoPlacas||0,costoCantos:costoCantos||0,costoHerr:costoHerr||0,costoCorte:costoCorte||0,costoPegado:costoPegado||0,costoPatas:costoPatas||0,costoVidrio:costoVidrio||0,costoApertura:costoApertura||0,total,t16,t32,t48 };
}

function calcPresupTotal(presup, precios, accs) {
  if (!presup) return { tm:0, ta:0, tpm:0, tled:0, tef:0, ttapa:0, textra:0, tenvio:0, sub:0, rent:0, ivaAmt:0, total:0 };
  // Use frozen prices if approved with snapshot, otherwise live prices
  const usePr = (presup.estado==="Aprobado" && presup.preciosSnapshot) ? presup.preciosSnapshot : precios;
  const pr = new Proxy(usePr||{}, { get: (o,k) => typeof o[k]==="number" ? o[k] : (parseFloat(o[k])||0) });
  const f = {...defFiltros, ...(presup.filtros || {})};

  // Use calcPlanilla as single source of truth for material costs
  const plan = calcPlanilla(presup, usePr);
  const tm = plan.grandTotal || 0;

  // Accesorios (not in planilla)
  const ta = (accs||[]).reduce((s, a) => s + (a.precio||0) * ((presup.accCant || {})[a.id] || 0), 0);
  // LED (not in planilla)
  const tled = (presup.metrosLed || 0) * pr.ledMl;
  // Estantes flotantes (not in planilla)
  const placaMapT = {agloBlanco:pr.placaAgloBlanco, agloColor:pr.placaAgloColor, mdfBlanco:pr.placaMdfBlanco, mdfColor:pr.placaMdfColor};
  const pPlacaInt = placaMapT[f.interior] || pr.placaAgloBlanco;
  let tef = 0;
  (presup.estFlotantes || []).forEach(ef => {
    const area = ((ef.ancho||0) * (ef.prof||0)) / 1e6;
    tef += area * pPlacaInt + ((ef.ancho||0) / 1000) * pr.perfilSopEstFlot;
  });

  // Items extra manuales
  const textra = (presup.itemsExtra||[]).reduce((s,it)=>s+(it.precioUnit||0)*(it.cantidad||0),0);

  // Extra pegado from manually added cantos
  let textraPeg = 0;
  (presup.itemsExtra||[]).filter(it=>it.seccion==="Cantos").forEach(ec=>{
    const d = (ec.descripcion||"").toLowerCase();
    const ml = ec.cantidad||0;
    if(d.includes("gloss")) textraPeg += ml * (pr.pegadoGloss||0);
    else if(d.includes("2mm")||d.includes("2 mm")||d.includes("blanco 2")||d.includes("color 2")) textraPeg += ml * (pr.pegado2||0);
    else textraPeg += ml * (pr.pegado04||0);
  });

  // Transporte (km × $/km) — not affected by rentabilidad
  const tenvio = (presup.kmEnvio || 0) * (pr.precioKm || 0);

  const sub = (tm||0) + (ta||0) + (tled||0) + (tef||0) + (textra||0) + (textraPeg||0);
  const rent = sub * ((f.rentabilidad||30) / 100);
  const ivaAmt = f.iva ? (sub + rent + tenvio) * 0.21 : 0;
  return { tm:tm||0, ta:ta||0, tpm:0, tled:tled||0, tef:tef||0, ttapa:0, textra:textra||0, tenvio:tenvio||0, sub, rent, ivaAmt, total: sub + rent + tenvio + ivaAmt };
}

// Board sizes in m²
const BOARD = { aglo: 2.750*1.830, mdf: 2.750*1.830, fibro: 2.600*1.830, gloss: 2.800*2.070 };
// Board sizes in mm (for CNC optimization)
const BOARD_MM = {
  agloBlanco:[2750,1830], agloColor:[2750,1830], mdfBlanco:[2750,1830], mdfColor:[2750,1830],
  fibroBlanco:[2600,1830], fibroColor:[2600,1830], gloss:[2800,2070]
};
const CNC_KERF = 4; // sierra 4mm
const CNC_TRIM = 10; // recorte borde 10mm/lado
const BAR_LEN = 3000; // perfil aluminio 3m
const BAR_KERF = 4; // sierra entre cortes

// ═══ 1D BAR CUTTING OPTIMIZER (FFD - First Fit Decreasing) ═══
// Optimizes profile cuts into 3000mm bars with 4mm kerf
// Returns { bars: [[{len, label},...], ...], totalBars, waste }
function barPack1D(cuts) {
  if(!cuts.length) return {bars:[],totalBars:0,waste:0};
  // Sort descending (largest first = best packing)
  const sorted = cuts.map(c=>({...c})).sort((a,b)=>b.len-a.len);
  const bars = []; // each bar = {pieces:[], remaining: BAR_LEN}

  sorted.forEach(cut => {
    for(let q=0; q<(cut.cant||1); q++) {
      // Try to fit in existing bar (First Fit)
      let placed = false;
      for(let i=0; i<bars.length; i++) {
        const needed = cut.len + (bars[i].pieces.length > 0 ? BAR_KERF : 0);
        if(needed <= bars[i].remaining) {
          bars[i].pieces.push({len:cut.len, label:cut.label||""});
          bars[i].remaining -= needed;
          placed = true;
          break;
        }
      }
      if(!placed) {
        // New bar
        bars.push({pieces:[{len:cut.len, label:cut.label||""}], remaining: BAR_LEN - cut.len});
      }
    }
  });

  const totalUsed = bars.reduce((s,b) => s + b.pieces.reduce((s2,p) => s2 + p.len, 0), 0);
  const totalKerf = bars.reduce((s,b) => s + Math.max(0, b.pieces.length - 1) * BAR_KERF, 0);
  const waste = bars.length * BAR_LEN - totalUsed - totalKerf;
  return { bars, totalBars: bars.length, waste, totalUsed, totalKerf };
}

// ═══ CNC GUILLOTINE OPTIMIZER (intelliDivide style) ═══
// Strict guillotine cuts (edge-to-edge like real Homag CNC)
// Multi-strategy: tries 6 sort strategies × 2 split modes, picks best result
// Grain: grainLock pieces → largo (w) must align with X (board W = 2750mm veta direction)
function cncPack(pieces, boardW, boardH) {
  if(!pieces.length) return {boards:[],totalBoards:0};
  const uW = boardW - CNC_TRIM*2;
  const uH = boardH - CNC_TRIM*2;
  const K = CNC_KERF;

  // Expand pieces
  const allPieces = [];
  pieces.forEach(p => {
    for(let i=0;i<p.cant;i++) allPieces.push({nombre:p.nombre,w:p.largo,h:p.ancho,modulo:p.modulo||"",grainLock:!!p.grainLock,area:p.largo*p.ancho});
  });

  // Get effective dimensions (respecting grain)
  const dims = (p, rot) => {
    if(rot && p.grainLock) return null; // can't rotate grain-locked
    return rot ? {w:p.h, h:p.w} : {w:p.w, h:p.h};
  };

  // ── STRATEGY 1: Recursive Guillotine ──
  // Places pieces in a rectangle using strict guillotine cuts
  function guilloFill(rects, remaining, W, H, x0, y0) {
    if(remaining.length === 0 || W < 30 || H < 30) return;

    // Find best piece for this rectangle
    let bestIdx=-1, bestRot=false, bestScore=-1;
    remaining.forEach((p,i) => {
      [false,true].forEach(rot => {
        const d = dims(p, rot);
        if(!d) return;
        if(d.w <= W && d.h <= H) {
          // Score: area coverage of this piece relative to rectangle
          const score = d.w * d.h;
          if(score > bestScore) { bestScore=score; bestIdx=i; bestRot=rot; }
        }
      });
    });

    if(bestIdx === -1) return;

    const piece = remaining[bestIdx];
    const d = dims(piece, bestRot);
    remaining.splice(bestIdx, 1);

    rects.push({
      nombre:piece.nombre, modulo:piece.modulo, grainLock:piece.grainLock,
      w:d.w, h:d.h, x:x0, y:y0, rotated:bestRot
    });

    // Guillotine split: try both orientations, pick better one
    // Option A: horizontal cut first (right strip + bottom strip)
    const rA = d.w + K, bA = d.h + K;
    const rightW_A = W - rA, rightH_A = d.h;
    const botW_A = W, botH_A = H - bA;

    // Option B: vertical cut first (bottom strip + right strip)
    const bB = d.h + K, rB = d.w + K;
    const botW_B = d.w, botH_B = H - bB;
    const rightW_B = W - rB, rightH_B = H;

    // Choose split that gives the larger usable sub-rectangle
    const maxA = Math.max(rightW_A * rightH_A, botW_A * botH_A);
    const maxB = Math.max(botW_B * botH_B, rightW_B * rightH_B);

    if(maxA >= maxB) {
      if(rightW_A > 30 && rightH_A > 30) guilloFill(rects, remaining, rightW_A, rightH_A, x0 + rA, y0);
      if(botW_A > 30 && botH_A > 30) guilloFill(rects, remaining, botW_A, botH_A, x0, y0 + bA);
    } else {
      if(botW_B > 30 && botH_B > 30) guilloFill(rects, remaining, botW_B, botH_B, x0, y0 + bB);
      if(rightW_B > 30 && rightH_B > 30) guilloFill(rects, remaining, rightW_B, rightH_B, x0 + rB, y0);
    }
  }

  // ── STRATEGY 2: Strip/Shelf packing (FFDH) ──
  function shelfFill(placed, remaining, W, H) {
    let y = 0;
    while(remaining.length > 0 && y < H) {
      // Find tallest piece that fits as strip leader
      let leaderIdx=-1, leaderH=0, leaderRot=false;
      remaining.forEach((p,i) => {
        [false,true].forEach(rot => {
          const d = dims(p, rot);
          if(!d) return;
          if(d.w <= W && d.h <= (H - y) && d.h > leaderH) {
            leaderH = d.h; leaderIdx = i; leaderRot = rot;
          }
        });
      });
      if(leaderIdx === -1) break;

      const stripH = leaderH;
      let x = 0;

      // Fill strip left to right with pieces that fit in stripH
      const toRemove = [];
      // Place leader first
      const ldr = remaining[leaderIdx];
      const ld = dims(ldr, leaderRot);
      placed.push({nombre:ldr.nombre,modulo:ldr.modulo,grainLock:ldr.grainLock,w:ld.w,h:ld.h,x,y,rotated:leaderRot});
      toRemove.push(leaderIdx);
      x += ld.w + K;

      // Fill rest of strip
      for(let i=0; i<remaining.length; i++) {
        if(toRemove.includes(i)) continue;
        const p = remaining[i];
        let placed2 = false;
        [false,true].forEach(rot => {
          if(placed2) return;
          const d = dims(p, rot);
          if(!d) return;
          if(d.w <= (W - x) && d.h <= stripH) {
            placed.push({nombre:p.nombre,modulo:p.modulo,grainLock:p.grainLock,w:d.w,h:d.h,x,y,rotated:rot});
            x += d.w + K;
            toRemove.push(i);
            placed2 = true;
          }
        });
      }

      // Remove placed pieces (reverse order)
      toRemove.sort((a,b)=>b-a).forEach(i=>remaining.splice(i,1));
      y += stripH + K;
    }
  }

  // ── RUN MULTIPLE STRATEGIES ──
  const sortFns = [
    (a,b) => b.area - a.area, // area desc
    (a,b) => Math.max(b.w,b.h) - Math.max(a.w,a.h), // longest side desc
    (a,b) => b.h - a.h || b.w - a.w, // height desc then width
    (a,b) => b.w - a.w || b.h - a.h, // width desc then height
    (a,b) => (b.w+b.h) - (a.w+a.h), // perimeter desc
    (a,b) => Math.max(b.w/b.h, b.h/b.w) - Math.max(a.w/a.h, a.h/a.w), // aspect ratio desc
  ];

  let bestResult = null, bestScore = Infinity;
  const totalArea = uW * uH;

  // Try each sort × each packing method
  sortFns.forEach(sortFn => {
    [0,1].forEach(method => { // 0=guillotine, 1=shelf
      const rem = allPieces.map(p=>({...p}));
      rem.sort(sortFn);
      const boards = [];

      while(rem.length > 0) {
        const brd = [];
        const before = rem.length;
        if(method === 0) {
          guilloFill(brd, rem, uW, uH, 0, 0);
        } else {
          shelfFill(brd, rem, uW, uH);
        }
        if(rem.length === before) break; // nothing placed, avoid infinite loop
        const usedArea = brd.reduce((s,p) => s + p.w*p.h, 0);
        boards.push({pieces:brd, usedArea, totalArea, efficiency:+(usedArea/totalArea*100).toFixed(1)});
      }

      // Score: fewer boards = better; on tie, higher avg efficiency = better
      const nBoards = boards.length + rem.length; // penalize unplaced pieces
      const avgEff = boards.length > 0 ? boards.reduce((s,b)=>s+b.efficiency,0)/boards.length : 0;
      const score = nBoards * 1000 - avgEff;

      if(score < bestScore) {
        bestScore = score;
        bestResult = boards;
      }
    });
  });

  return { boards: bestResult || [], totalBoards: (bestResult||[]).length };
}

function calcPlanilla(presup, precios) {
  const f = {...defFiltros, ...(presup.filtros || {})};
  const esGloss = f.puerta === "gloss";

  // Accumulators
  const pl = { agloBlanco:0, agloColor:0, mdfBlanco:0, mdfColor:0, fibroBlanco:0, fibroColor:0, gloss:0 };
  const cn = { blanco04:0, blanco2:0, color04:0, color2:0, gloss1:0 };
  const cortes = { comun:0, gloss:0 };
  const peg = { p04:0, p2:0, pGloss:0 };
  const herr = {};
  const addH = (k,n)=>{ herr[k] = (herr[k]||0) + n; };

  // CNC: collect actual pieces per board type
  const pzBoard = { agloBlanco:[], agloColor:[], mdfBlanco:[], mdfColor:[], fibroBlanco:[], fibroColor:[], gloss:[] };

  // Vidrio: collect individual profile cuts for 1D bar optimization
  const profCuts = {}; // keyed by profile name → [{len, cant, label, modulo}]
  const vidrioArea = {}; // keyed by vidrio type → m²
  let escuadras2045 = 0;

  // Placa key from puerta setting
  const placaKey = (mat) => {
    if(mat==="gloss") return "gloss";
    return mat || "agloBlanco";
  };

  (presup.modulos || []).forEach(ms => {
    const mod = ALL_MODS.find(m=>m.id===ms.modId);
    if(!mod) return;
    const q = ms.cantidad || 1;
    const ov = ms.ov || {};
    const piezas = getPiezas(mod.tipo, ms.ancho, f, ms.altoBasc);
    const modLabel = mod.nombre+" "+ms.ancho+"mm";

    // Per-module effective values (ov overrides f)
    const mInt = ov.interior || f.interior || "agloBlanco";
    const mPta = ov.puerta || f.puerta || "agloBlanco";
    const mFondo = ov.colorFondo || f.colorFondo || "blanco";
    const mCantoFront = ov.cantoFrontal || f.cantoFrontal || "blanco04";
    const mCantoInt = ov.cantoInt || f.cantoInt || "blanco04";
    const mCantoPta = ov.cantoPuerta || f.cantoPuerta || "blanco04";
    const mEsGloss = mPta === "gloss";

    // ── Plates & cantos ──
    const mAp = ov.apertura || f.apertura || "melamina";
    let pzCuerpo=0, pzFrente=0, mlIntFront=0, mlIntBack=0, mlPuerta=0, mlTravFront=0, mlTravBack=0;
    const esColorPuerta2 = mPta.includes("Color");
    const travFenPuerta2 = esColorPuerta2 || mAp === "golaMadera";
    piezas.forEach(p => {
      const area = p.cant * p.largo * p.ancho / 1e6;
      const ml = mlP(p);
      if(p.zona==="Fondo") {
        const fk = mFondo==="blanco"?"fibroBlanco":"fibroColor";
        if(mFondo==="blanco") pl.fibroBlanco += area*q; else pl.fibroColor += area*q;
        pzBoard[fk].push({nombre:p.nombre, largo:p.largo, ancho:p.ancho, cant:p.cant*q, modulo:modLabel});
      } else if(p.zona==="Pta") {
        const pk = placaKey(mPta);
        if(pk==="gloss") pl.gloss += area*q;
        else pl[pk] = (pl[pk]||0) + area*q;
        const isColorBoard = pk.includes("Color");
        pzBoard[pk].push({nombre:p.nombre, largo:p.largo, ancho:p.ancho, cant:p.cant*q, modulo:modLabel, grainLock:isColorBoard});
        mlPuerta += ml*q; pzFrente += p.cant*q;
      } else if(p.zona==="TravF") {
        const tk = travFenPuerta2 ? placaKey(mPta) : placaKey(mInt);
        pl[tk] = (pl[tk]||0) + area*q;
        const isColorTrav = tk.includes("Color");
        pzBoard[tk].push({nombre:p.nombre, largo:p.largo, ancho:p.ancho, cant:p.cant*q, modulo:modLabel, grainLock:isColorTrav});
        mlTravFront += p.cant * p.cSup * p.largo / 1e3 * q;
        mlTravBack += p.cant * p.cInf * p.largo / 1e3 * q;
        pzCuerpo += p.cant*q;
      } else {
        const ik = placaKey(mInt);
        pl[ik] = (pl[ik]||0) + area*q;
        pzBoard[ik].push({nombre:p.nombre, largo:p.largo, ancho:p.ancho, cant:p.cant*q, modulo:modLabel});
        const esFrenteVisible = /^(Base|Lateral|Techo|Paño fijo|Espaciador)/.test(p.nombre);
        if(esFrenteVisible) {
          mlIntFront += p.cant * p.cSup * p.largo / 1e3 * q;
          mlIntBack += p.cant * (p.cInf * p.largo + p.cIzq * p.ancho + p.cDer * p.ancho) / 1e3 * q;
        } else {
          mlIntBack += p.cant * (p.cSup * p.largo + p.cInf * p.largo + p.cIzq * p.ancho + p.cDer * p.ancho) / 1e3 * q;
        }
        pzCuerpo += p.cant*q;
      }
    });

    // Canto accum
    cn[mCantoFront] = (cn[mCantoFront]||0) + mlIntFront + mlTravFront;
    cn[mCantoInt] = (cn[mCantoInt]||0) + mlIntBack + mlTravBack;
    if(mEsGloss) { cn.gloss1 += mlPuerta; }
    else { cn[mCantoPta] = (cn[mCantoPta]||0) + mlPuerta; }

    // Cuts
    if(mEsGloss) { cortes.comun += pzCuerpo; cortes.gloss += pzFrente; }
    else { cortes.comun += pzCuerpo + pzFrente; }

    // Pegado
    const pegInt = cantoPeg(mCantoInt), pegFront = cantoPeg(mCantoFront), pegPta = mEsGloss?"gloss":cantoPeg(mCantoPta);
    const mlAllFront = mlIntFront + mlTravFront;
    const mlAllBack = mlIntBack + mlTravBack;
    if(pegFront==="gloss") peg.pGloss+=mlAllFront; else if(pegFront==="2") peg.p2+=mlAllFront; else peg.p04+=mlAllFront;
    if(pegInt==="gloss") peg.pGloss+=mlAllBack; else if(pegInt==="2") peg.p2+=mlAllBack; else peg.p04+=mlAllBack;
    if(pegPta==="gloss") peg.pGloss+=mlPuerta; else if(pegPta==="2") peg.p2+=mlPuerta; else peg.p04+=mlPuerta;

    // ── Hardware ──
    const t = mod.tipo;
    const mBis = ov.bisagra || f.bisagra || "comun";
    const mCorr = ov.corredera || f.corredera || "comun";
    const mCorrMed = ov.correderaMedida || f.correderaMedida || "50";
    const mPist = ov.piston || f.tipoPiston || "skoN120";
    const hColor = ov.colorHerraje || f.colorHerraje || "aluminio";
    const colorLabel = hColor==="negro"?" negro":" aluminio";
    const latDe = getLatDe(f);

    let nBis=0,nCorr=0,nEst=0,nTrav=0,nBas=0,nMinif=0,nPist=0,nProtI=0,nPasac=0;
    if(t==="bm2p"){nBis=4;nEst=1;nTrav=2;nBas=1;}
    else if(t==="bm1p"){nBis=2;nEst=1;nTrav=2;nBas=1;}
    else if(t==="caj3"){nCorr=3;nTrav=2;nBas=1;}
    else if(t==="caj2"){nCorr=2;nTrav=2;nBas=1;}
    else if(t==="esq1p"){nBis=2;nEst=1;nTrav=2;nBas=1;}
    else if(t==="esq2p"){nBis=4;nEst=1;nTrav=2;nBas=1;}
    else if(t==="esqcomp"){nBis=4;nEst=2;nTrav=4;nBas=2;nMinif=4;}
    else if(t==="horno"){nCorr=1;nEst=1;nTrav=1;nBas=1;nProtI=4;}
    else if(t==="al2p"){nBis=4;nEst=1;}
    else if(t==="al1p"){nBis=2;nEst=1;}
    else if(t==="alesq1p"){nBis=2;nEst=1;}
    else if(t==="alesq2p"){nBis=4;nEst=1;}
    else if(t==="albasc1p"){nBis=2;nPist=2;nEst=1;}
    else if(t==="albasc2p"){nBis=4;nPist=4;nEst=1;}
    else if(t==="vinoteca"){nEst=Math.floor(getLatAl(f)/120);}
    else if(t==="micro1p"){nBis=2;nPist=2;nEst=1;}
    else if(t==="micro2p"){nBis=4;nEst=1;}
    else if(t==="desp1p"){const ph=latDe+29;nBis=ph>1800?5:2;nEst=Math.floor(latDe/350);}
    else if(t==="desp2p"){const ph=latDe+29;nBis=ph>1800?10:4;nEst=Math.floor(latDe/350);}
    else if(t==="torre1"){nCorr=2;nBis=2;nPist=2;nPasac=1;nEst=3;nTrav=2;nBas=2;}
    else if(t==="torre2"){nBis=6;nPist=2;nPasac=1;nEst=4;nTrav=2;nBas=2;}
    else if(t==="torre3"){nCorr=2;nBis=4;nPasac=1;nEst=3;nTrav=2;nBas=2;}
    else if(t==="heladera"){nBis=4;nEst=2;}

    const bisNom = (mBis==="comun"?"Bisagra común":"Bisagra cierre suave")+colorLabel;
    addH(bisNom, nBis*q);
    if(nCorr>0) {
      const corrTipo = t==="horno"?"push":mCorr;
      const corrMed = t==="horno"?"50":mCorrMed;
      const corrNom = corrTipo==="cierreSuave"?`Corredera CS ${corrMed}cm${colorLabel}`:corrTipo==="push"?`Corredera push ${corrMed}cm${colorLabel}`:corrTipo==="matrix"?`Matrix Box ${corrMed==="45"?"450":"500"}`:corrTipo==="lateral"?"Lateral metálico":`Corredera común ${corrMed}cm${colorLabel}`;
      addH(corrNom, nCorr*q);
    }
    if(nPist>0) { const pistNom=mPist==="skoN120"?"Pistón SKO N120":mPist==="n100"?"Pistón N100":"Pistón F.Inversa"; addH(pistNom,nPist*q); }
    if(nProtI>0) addH("Protector ignífugo", nProtI*q);
    if(nPasac>0) addH("Pasacable PVC", nPasac*q);
    addH("Soporte estante", nEst*4*q);
    if(nMinif>0) addH("Minifix", nMinif*q);
    const t16=nBis*4+nCorr*8, t32=nTrav*4, t48=nBas*6+(mod.cajones||0)*8;
    addH("Tornillo 16mm", t16*q); if(t32>0) addH("Tornillo 32mm", t32*q); if(t48>0) addH("Tornillo 48mm", t48*q);
    if(mCorr==="matrix"&&f.setBarraLat&&nCorr>0) addH("Set barra lateral", nCorr*q);
    if(mod.cat==="al"&&mBis==="push"&&mod.puertas>0) addH("Expulsor push", mod.puertas*2*q);
    if(mod.cat==="al") { addH("Soporte alacena",2*q); addH("Tarugo",2*q); addH("Tornillo 60mm",2*q); addH("Tornillo 16mm",8*q); }
    if(f.baseBM==="patas"&&(mod.cat==="bm"||mod.cat==="de"||mod.cat==="to")) {
      addH("Pata plástica",4*q); addH("Clip zócalo",q); addH("Zócalo aluminio (ml)",+(ms.ancho/1000*q).toFixed(2));
    }

    // Apertura
    const nPtas=mod.puertas||0, nCaj=mod.cajones||0, nFr=nPtas+nCaj;
    if(nFr>0) {
      // Gola Superior names (puertas + 1er cajón)
      const golaSupMap={alumBlanco:"Gola Sup. alum. blanco (3m)",alumNegro:"Gola Sup. alum. negro (3m)",alumNatural:"Gola Sup. alum. natural (3m)",
        perfilMC:"Gola Sup. MC (3m)",perfilMH:"Gola Sup. MH (3m)",perfilMJ:"Gola Sup. MJ (3m)"};
      // Gola Medio names (1 por cada cajón)
      const golaMedMap={alumBlanco:"Gola Med. alum. blanco (3m)",alumNegro:"Gola Med. alum. negro (3m)",alumNatural:"Gola Med. alum. natural (3m)",
        perfilMC:"Gola Med. MC (3m)",perfilMH:"Gola Med. MH (3m)",perfilMJ:"Gola Med. MJ (3m)"};
      const isGola = !!golaSupMap[mAp];
      const isGolaAlum = ["alumBlanco","alumNegro","alumNatural"].includes(mAp);
      // Tiradores: precio por unidad
      const tirMap={class70:"Tirador Class 70",class70negro:"Tirador Class 70 negro",barral96L:"Tirador Barral 96mm",barral128L:"Tirador Barral 128mm",udineNegro192:"Tirador Udine negro 192",udineAlum192:"Tirador Udine alum 192",manijaBarralInox128:"Manija Barral Inox 128",manijaBergamo96:"Manija Bergamo 96",tiradorBoton:"Tirador Botón",manijaBarralEsquel128:"Manija Barral Esquel 128"};

      if(isGola) {
        const golaLen = ms.ancho; // ancho completo del módulo
        const nomSup = golaSupMap[mAp];
        const nomMed = golaMedMap[mAp];
        // Gola Superior: siempre 1 solo perfil del ancho del módulo
        if(!profCuts[nomSup]) profCuts[nomSup] = [];
        profCuts[nomSup].push({len:golaLen, cant:1*q, label:`Sup ${golaLen}mm (${modLabel})`});
        // Gola Medio: solo 1 si hay 2+ cajones (va entre cajones)
        if(nCaj >= 2) {
          if(!profCuts[nomMed]) profCuts[nomMed] = [];
          profCuts[nomMed].push({len:golaLen, cant:1*q, label:`Med ${golaLen}mm (${modLabel})`});
        }
        // Gola Aluminio: 2 escuadras gola por módulo
        if(isGolaAlum) addH("Escuadra Gola", 2*q);
      } else if(tirMap[mAp]) { addH(tirMap[mAp], nFr*q); }
      // golaMadera → 2 soportes gola por bajo mesada
      if(mAp==="golaMadera" && mod.cat==="bm") addH("Soporte Gola", 2*q);
      // melamina, push → sin material de apertura extra
    }

    // Vidrio - collect individual cuts for global 1D bar optimization
    if(mod.cat==="al" && ov.vidrio) {
      const vNom = ov.vidrio==="bronce"?"Vidrio bronce":ov.vidrio==="espejado"?"Vidrio espejado":"Vidrio incoloro";
      const ptaPz = piezas.filter(p=>p.zona==="Pta");
      let areaV=0;
      ptaPz.forEach(p=>{ const vL=Math.max(0,p.largo-80),vA=Math.max(0,p.ancho-80); areaV+=p.cant*vL*vA/1e6; });
      vidrioArea[vNom] = (vidrioArea[vNom]||0) + areaV*q;

      const perfV=ov.perfilVidrio||"top2045";
      const pNom=perfV==="sierra"?"Perfil Sierra (3m)":perfV==="interNegro"?"Perfil Inter negro (3m)":perfV==="interAlum"?"Perfil Inter aluminio (3m)":"Perfil Top 20×45 (3m)";
      if(!profCuts[pNom]) profCuts[pNom] = [];
      ptaPz.forEach(p=>{
        const vL=Math.max(0,p.largo-80), vA=Math.max(0,p.ancho-80);
        // Each door: 2 largos + 2 anchos of profile
        profCuts[pNom].push({len:vL, cant:p.cant*2*q, label:`L${vL} (${modLabel})`});
        profCuts[pNom].push({len:vA, cant:p.cant*2*q, label:`A${vA} (${modLabel})`});
      });
      if(perfV==="top2045") escuadras2045 += ptaPz.reduce((s,p)=>s+p.cant,0)*4*q;
    }
  });

  // Piezas manuales
  (presup.piezasManuales || []).forEach(pm => {
    const area = (pm.largo*pm.ancho)/1e6 * (pm.cantidad||1);
    const mlC = ((pm.largo+2*pm.ancho)/1e3) * (pm.cantidad||1);
    const ik = f.interior||"agloBlanco";
    pl[ik] = (pl[ik]||0) + area;
    pzBoard[ik].push({nombre:"Pieza manual", largo:pm.largo, ancho:pm.ancho, cant:pm.cantidad||1, modulo:"Manual"});
    cn[f.cantoInt||"blanco04"] = (cn[f.cantoInt||"blanco04"]||0) + mlC;
    cortes.comun += (pm.cantidad||1);
    const pegT = cantoPeg(f.cantoInt);
    if(pegT==="gloss") peg.pGloss+=mlC; else if(pegT==="2") peg.p2+=mlC; else peg.p04+=mlC;
  });

  // Tapas de terminación
  const altAlPlan = getAltAl(f);
  (presup.tapasTerminacion || []).forEach(tp => {
    const largo = tp.tipo==="bm" ? 800 : altAlPlan;
    const ancho = tp.tipo==="bm" ? 562 : 332;
    const q = tp.cantidad || 1;
    const mat = tp.material || f.puerta || "agloBlanco";
    const area = (largo * ancho) / 1e6 * q;
    const mlC = (largo + 2 * ancho) / 1e3 * q; // 1 largo + 2 cortos

    // Placa
    const pk = mat==="gloss"?"gloss":mat;
    pl[pk] = (pl[pk]||0) + area;
    const isColor = pk.includes("Color");
    pzBoard[pk].push({nombre:`Tapa ${tp.tipo==="bm"?"BM":"AL"}`, largo, ancho, cant:q, modulo:"Tapa term.", grainLock:isColor});

    // Canto
    const ck = tp.canto || "blanco04";
    cn[ck] = (cn[ck]||0) + mlC;

    // Cortes
    if(mat==="gloss") cortes.gloss+=q; else cortes.comun+=q;

    // Pegado
    const pegT = cantoPeg(ck);
    if(pegT==="gloss") peg.pGloss+=mlC; else if(pegT==="2") peg.p2+=mlC; else peg.p04+=mlC;
  });

  // ═══ CNC OPTIMIZATION ═══
  const cncResults = {};
  Object.keys(pzBoard).forEach(k=>{
    if(pzBoard[k].length>0 && BOARD_MM[k]) {
      cncResults[k] = cncPack(pzBoard[k], BOARD_MM[k][0], BOARD_MM[k][1]);
    }
  });

  // Boards needed — CNC optimized with unit price & cost
  // Boards needed — CNC optimized with unit price & cost
  const boards = {};
  const boardPrice = {agloBlanco:precios.placaAgloBlanco, agloColor:precios.placaAgloColor, mdfBlanco:precios.placaMdfBlanco, mdfColor:precios.placaMdfColor, fibroBlanco:precios.placaFibroBlanco, fibroColor:precios.placaFibroColor, gloss:precios.placaGloss};
  const boardSz = {agloBlanco:BOARD.aglo, agloColor:BOARD.aglo, mdfBlanco:BOARD.mdf, mdfColor:BOARD.mdf, fibroBlanco:BOARD.fibro, fibroColor:BOARD.fibro, gloss:BOARD.gloss};
  const boardNames = {agloBlanco:"Placa aglo blanco (2750×1830)", agloColor:"Placa aglo color (2750×1830)", mdfBlanco:"Placa MDF blanco (2750×1830)", mdfColor:"Placa MDF color (2750×1830)", fibroBlanco:"Fondo fibro blanco (2600×1830)", fibroColor:"Fondo fibro color (2600×1830)", gloss:"Placa Gloss (2800×2070)"};
  Object.keys(pl).forEach(k=>{
    if(pl[k]>0){
      const cnc = cncResults[k];
      const placasCNC = cnc ? cnc.totalBoards : Math.ceil(pl[k]/boardSz[k]);
      const precioUnit = boardPrice[k] * boardSz[k]; // precio por placa entera
      boards[boardNames[k]] = {
        m2: +pl[k].toFixed(2),
        placas: placasCNC,
        precioUnit,
        costo: placasCNC * precioUnit,
        cnc: cnc || null // CNC detail (board layouts)
      };
    }
  });

  // ═══ VIDRIO PROFILE BAR OPTIMIZATION (1D FFD) ═══
  const vidrioBarras = {};
  Object.entries(profCuts).forEach(([perfNom, cuts])=>{
    if(cuts.length > 0) {
      const result = barPack1D(cuts);
      vidrioBarras[perfNom] = result;
      addH(perfNom, result.totalBars);
    }
  });
  // Add vidrio area and escuadras to herrajes
  Object.entries(vidrioArea).forEach(([nom,area])=>{ if(area>0) addH(nom+" (m²)", +area.toFixed(3)); });
  if(escuadras2045 > 0) addH("Escuadra 20×45", escuadras2045);

  // ═══ AUTO-CALC: Embalaje y Lija (basado en placas no-fibro) ═══
  const totalPlacasNoFibro = Object.entries(boards).reduce((s,[nom,b]) => {
    if(nom.toLowerCase().includes("fibro")) return s;
    return s + (b.placas||0);
  }, 0);
  if(totalPlacasNoFibro > 0) {
    addH("Embalaje film (1 x placa)", totalPlacasNoFibro);
    addH("Lija esponja (1 c/5 placas)", Math.ceil(totalPlacasNoFibro / 5));
  }

  // ═══ TORNILLOS: Convertir unidades a cajas para compra ═══
  const tornilloBoxes = {};
  const calcCajas = (units, boxSmall, boxBig) => {
    if(units <= 0) return [];
    if(!boxBig) {
      // Solo una medida de caja
      return [{ cant: Math.ceil(units / boxSmall.u), ...boxSmall }];
    }
    // Optimizar: elegir combinación más económica
    if(units <= boxSmall.u) return [{ cant: 1, ...boxSmall }];
    if(units <= boxSmall.u * 2 && (!boxBig || boxSmall.p * 2 <= boxBig.p)) return [{ cant: 2, ...boxSmall }];
    if(units <= (boxBig?.u||Infinity)) return [{ cant: 1, ...boxBig }];
    const bigBoxes = Math.floor(units / boxBig.u);
    const resto = units - bigBoxes * boxBig.u;
    const cajas = [{ cant: bigBoxes, ...boxBig }];
    if(resto > 0) cajas.push({ cant: Math.ceil(resto / boxSmall.u), ...boxSmall });
    return cajas;
  };
  // Process each tornillo type
  ["16mm","32mm","48mm","60mm"].forEach(sz => {
    const key = "Tornillo "+sz;
    const units = herr[key] || 0;
    if(units <= 0) return;
    let cajas;
    if(sz==="16mm") cajas = calcCajas(units, {u:200,p:precios.cajaTorn16x200||6442,label:"caja×200"}, {u:600,p:precios.cajaTorn16x600||11876,label:"caja×600"});
    else if(sz==="32mm") cajas = calcCajas(units, {u:200,p:precios.cajaTorn32x200||8328,label:"caja×200"}, {u:600,p:precios.cajaTorn32x600||23145,label:"caja×600"});
    else if(sz==="48mm") cajas = calcCajas(units, {u:300,p:precios.cajaTorn48x300||11214,label:"caja×300"}, null);
    else if(sz==="60mm") cajas = calcCajas(units, {u:100,p:precios.cajaTorn60x100||12629,label:"caja×100"}, null);
    tornilloBoxes[key] = { units, cajas, costoTotal: cajas.reduce((s,c)=>s+c.cant*c.p, 0) };
  });

  // Cantos (ml) — with 30% extra + unit price & cost
  const cantos = {};
  const cantoNames = {blanco04:"Canto blanco 0.4mm", blanco2:"Canto blanco 2mm", color04:"Canto color 0.4mm", color2:"Canto color 2mm", gloss1:"Canto gloss 1mm"};
  const cantoPrices = {blanco04:precios.cantoBlanco04, blanco2:precios.cantoBlanco2, color04:precios.cantoColor04, color2:precios.cantoColor2, gloss1:precios.cantoGloss1};
  Object.keys(cn).forEach(k=>{
    if(cn[k]>0) {
      const mlBase = +cn[k].toFixed(2);
      const mlExtra = +(cn[k] * 0.30).toFixed(2);
      const mlTotal = +(mlBase + mlExtra).toFixed(2);
      cantos[cantoNames[k]] = { mlBase, mlExtra, ml: mlTotal, precioMl: cantoPrices[k], costo: mlTotal * cantoPrices[k] };
    }
  });

  // ═══ COMPUTE GRAND TOTAL ═══
  // Dynamic herraje price lookup (handles names with color/size)
  const herrLookup = (nom) => {
    const n = nom.toLowerCase();
    // Bisagras
    if(n.includes("bisagra") && n.includes("cierre suave")) return precios.bisagraCierreSuave;
    if(n.includes("bisagra") && n.includes("común")) return precios.bisagraComun;
    // Correderas by type+size
    if(n.includes("matrix")) return n.includes("450")?(precios.matrixBox450||precios.matrixBox):precios.matrixBox;
    if(n.includes("lateral met")) return precios.lateralMet;
    if(n.includes("corredera")) {
      const szMatch = n.match(/(\d+)cm/); const sz = szMatch ? szMatch[1] : "50";
      if(n.includes(" cs ") || n.includes(" cs\u00a0")) { const k="correderaCS"+(sz==="50"?"":sz); return precios[k]||precios.correderaCS; }
      if(n.includes("push")) { const k="correderaPush"+(sz==="50"?"":sz); return precios[k]||precios.correderaPush; }
      const k="correderaComun"+(sz==="50"?"":sz); return precios[k]||precios.correderaComun;
    }
    // Pistones
    if(n.includes("pistón") && n.includes("sko")) return precios.pistonSKON120;
    if(n.includes("pistón") && n.includes("inversa")) return precios.pistonFuerzaInv;
    if(n.includes("pistón") && n.includes("n100")) return precios.pistonN100;
    if(n.includes("pistón") && n.includes("n120")) return precios.pistonN100;
    // Static fallback
    const staticMap = {
      "expulsor push":precios.expulsorPush,"soporte estante":precios.soporteEstante,"minifix":precios.minifix,
      "soporte alacena":precios.soporteAlacena,"tarugo":precios.tarugo,"pata plástica":precios.pataPlastica,
      "clip zócalo":precios.clipZocalo,"escuadra soporte":precios.escuadraSoporte,
      "pasacable pvc":precios.pasacablePVC,"protector ignífugo":precios.protectorIgnifugo,
      "set barra lateral":precios.setBarraLat,"zócalo aluminio (ml)":precios.zocaloAlumMl,
      "tornillo 16mm":precios.tornillo16,"tornillo 32mm":precios.tornillo32,"tornillo 48mm":precios.tornillo48,"tornillo 60mm":precios.tornillo60,
      "embalaje film":precios.embalajeFilm||15822,"lija esponja":precios.lijaEsponja||3848,
    };
    for(const [k,v] of Object.entries(staticMap)) { if(n.includes(k)) return v; }
    return 0;
  };

  // Override tornillo costs with box costs in grandTotal
  const tornilloOverride = {};
  Object.entries(tornilloBoxes).forEach(([key,tb])=>{
    tornilloOverride[key] = tb.costoTotal;
  });
  const herrPriceMap = {
    "Gola Sup. alum. blanco (3m)":precios.perfilAlumBlanco,"Gola Sup. alum. negro (3m)":precios.perfilAlumNegro,"Gola Sup. alum. natural (3m)":precios.perfilAlumNatural,
    "Gola Med. alum. blanco (3m)":precios.perfilMedAlumBlanco,"Gola Med. alum. negro (3m)":precios.perfilMedAlumNegro,"Gola Med. alum. natural (3m)":precios.perfilMedAlumNatural,
    "Gola Sup. MC (3m)":precios.perfilMC,"Gola Sup. MH (3m)":precios.perfilMH,"Gola Sup. MJ (3m)":precios.perfilMJ,
    "Gola Med. MC (3m)":precios.perfilMedMC,"Gola Med. MH (3m)":precios.perfilMedMH,"Gola Med. MJ (3m)":precios.perfilMedMJ,
    "Escuadra Gola":precios.escuadraGola,"Soporte Gola":precios.soporteGola,
    "Tirador Class 70":precios.tiradorClass70,"Tirador Class 70 negro":precios.tiradorClass70Negro,
    "Tirador Barral 96mm":precios.tiradorBarral96L,"Tirador Barral 128mm":precios.tiradorBarral128L,
    "Tirador Udine negro 192":precios.tiradorUdineNegro192,"Tirador Udine alum 192":precios.tiradorUdineAlum192,
    "Manija Barral Inox 128":precios.manijaBarralInox128,"Manija Bergamo 96":precios.manijaBergamo96,"Tirador Botón":precios.tiradorBoton,"Manija Barral Esquel 128":precios.manijaBarralEsquel128,
    "Perfil Top 20×45 (3m)":precios.perfilTop2045,"Perfil Sierra (3m)":precios.perfilSierra,
    "Perfil Inter negro (3m)":precios.perfilInterNegro,"Perfil Inter aluminio (3m)":precios.perfilInterAlum,
    "Escuadra 20×45":precios.escuadraAlum2045,"Perfil Sop. Est. Flotante":precios.perfilSopEstFlot,
    "Vidrio bronce (m²)":precios.vidrioBronce,"Vidrio espejado (m²)":precios.vidrioEspejado,"Vidrio incoloro (m²)":precios.vidrioIncoloro,
  };
  let grandTotal = 0;
  // Boards
  Object.values(boards).forEach(b => { grandTotal += b.costo || 0; });
  // Cantos
  Object.values(cantos).forEach(c => { grandTotal += c.costo || 0; });
  // Cortes (+25%)
  if(cortes.comun > 0) { grandTotal += (cortes.comun + Math.ceil(cortes.comun * 0.25)) * (precios.corteComun||0); }
  if(cortes.gloss > 0) { grandTotal += (cortes.gloss + Math.ceil(cortes.gloss * 0.25)) * (precios.corteGloss||0); }
  // Pegado (by thickness: 0.4mm total, 2mm total, gloss total)
  if(peg.p04 > 0) grandTotal += peg.p04 * (precios.pegado04||0);
  if(peg.p2 > 0) grandTotal += peg.p2 * (precios.pegado2||0);
  if(peg.pGloss > 0) grandTotal += peg.pGloss * (precios.pegadoGloss||0);
  // Herrajes
  Object.entries(herr).forEach(([nom, cant]) => {
    // Tornillos: use box cost instead of unit cost
    if(tornilloOverride[nom] !== undefined) {
      grandTotal += tornilloOverride[nom];
    } else {
      grandTotal += (herrPriceMap[nom] || herrLookup(nom) || 0) * cant;
    }
  });

  return { boards, cantos, cortes, pegado:peg, herrajes:herr, vidrioBarras, tornilloBoxes, precios: precios, grandTotal };
}

/* ═══════════════════════════════════════════════════════
   4. HELPERS
   ═══════════════════════════════════════════════════════ */

const $ = (n) => { if(typeof n!=="number"||isNaN(n)) n=0; const v = Math.abs(n); const [int,dec] = v.toFixed(2).split("."); const thousands = int.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return (n<0?"-":"")+"$"+thousands+","+dec; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

// Print helper: creates iframe with content and triggers print dialog
function doPrint(contentEl, fileName) {
  if(!contentEl) return;
  const name = (fileName || "presupuesto") + ".pdf";
  const html = contentEl.outerHTML;
  
  // Open clean window with content
  const printPage = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#fff;color:#333}
.no-print{display:none!important}
input,select,textarea,button{display:none!important}
#content{max-width:760px;margin:0 auto;padding:20px;background:#fff}
#loading{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:999}
#loading div{background:#fff;padding:30px 50px;border-radius:12px;text-align:center;font-family:sans-serif}
table{width:100%!important;max-width:100%!important}
svg{max-width:720px!important;height:auto!important}
</style>
</head>
<body>
<div id="loading"><div><div style="font-size:18px;font-weight:700;margin-bottom:8px">Generando PDF...</div><div style="font-size:13px;color:#888">Descargando en unos segundos</div></div></div>
<div id="content">${html}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"><\/script>
<script>
document.fonts.ready.then(function(){
  setTimeout(function(){
    var el = document.getElementById('content');
    var opt = {
      margin: [6,4,6,4],
      filename: '${name.replace(/'/g,"\\'")}',
      image: {type:'jpeg',quality:0.92},
      html2canvas: {scale:2,useCORS:true,logging:false,width:760,windowWidth:760},
      jsPDF: {unit:'mm',format:'a4',orientation:'portrait'},
      pagebreak: {mode:['avoid-all','css','legacy']}
    };
    html2pdf().set(opt).from(el).save().then(function(){
      document.getElementById('loading').style.display='none';
      document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column;gap:12px"><div style="font-size:18px;font-weight:700;color:#16a34a">✅ PDF descargado</div><div style="font-size:13px;color:#888">Podés cerrar esta ventana</div><button onclick="window.close()" style="padding:8px 24px;border-radius:8px;border:1px solid #ddd;background:#f5f5f5;cursor:pointer;font-size:13px">Cerrar</button></div>';
    });
  }, 600);
});
<\/script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if(w) { w.document.write(printPage); w.document.close(); }
}


/* ═══════════════════════════════════════════════════════
   5. STYLES
   ═══════════════════════════════════════════════════════ */

const G = "#c9a96e", D = "#1a1a2e", D2 = "#2d2d44";
const LOGO_B64 = "data:image/jpeg;base64,/9j/7gAOQWRvYmUAZAAAAAAA/9sAQwAGBAUGBQQGBgUGBwcGCAoQCgoJCQoUDg8MEBcUGBgXFBYWGh0lHxobIxwWFiAsICMmJykqKRkfLTAtKDAlKCko/8AAFAgAfQEsBEMRAE0RAFkRAEsRAP/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAA4EQwBNAFkASwAAPwD6pr6pr6pr5ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooq3af6tv97+goooqpRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRVu0/1bf739BRRRVSiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiirdp/q2/3v6CiiiqlFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFV7y9trNN91MkQ/wBo8n6Cobm6gtU3XEqRj3PWobm6gtU3XEqRj3PWtnwz4X1zxRd/Z/D2lXeoSZwxgjJVP95vur+JrnNQ8XxrlbCEyH+/JwPy6/yrDvfEqLlbSIuf7z8D8utYd74lRcraRFz/AHn4H5da928E/swajdeXP4x1WOxj6m1scSSfQyH5R+Aauh0qd7nTraaXG+SMM2BgZIra0+Vp7GCWTG90DHHrW1p8rT2MEsmN7oGOPWvEfiFpNtoPjrX9JsA4tLG9kt4t7bm2qcDJ7mrVWKsVz1FFFFFFFFFFFFFFFFFFFW7T/Vt/vf0FFFFVKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK1bG00iW1R7zWJrac53RLYNKF54+YOM/lRRRU/wBg0D/oYLj/AMFb/wDxyiiikNhoXbX5/wDwVv8A/F0UUUhsdD/6D0//AILH/wDi6KKKT7Fon/Qcn/8ABa3/AMXRRRSGy0X/AKDc/wD4Lm/+LooopPsejf8AQam/8F7f/F0UUUn2PSO2szf+C9v/AIuiiimm00n/AKC83/gA3/xdFFFJ9l0r/oLS/wDgC3/xVFFFIbXS/wDoKy/+ATf/ABVMnk8qGSQjIRS2PoKbK/lxO5GdoJxTZX8uJ3IztBOKmsdN0+8vra1j1Vw88qRKTZtgFmAH8XvXnd/4yvbrItgttGf7vLfmf6VxN54ourjIgC26H+7y351xF54ourjIgCwIf7vLfnX1x4J/Zy8JaJ5c2utPr12vJE/7uAH2jU8/8CJrFe5aZy8rs7nqzHJNZTXBkctIxZj1LHJrLa4MrlpGLMepY5Nez6fZWmnWiWun20FrbIMLFDGERfoBxShwe9KGBpQwNWa9R0H/AJAtl/1xX+VegaP/AMgu0/65L/KvQNH/AOQXaf8AXJf5V+d/xi/5Kv4v/wCwpP8A+hVfq5VyuPoooooooooooooooooooq3af6tv97+goooqpRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRUGocWFz/wBc2/kahveLOf8A65t/Kob3izn/AOubfyrR8N/8jFpP/X5B/wCjFrwiOf5Rz2ryBJuBz2rx9J+Bz2r9K88n61Mtx71Ks3vUqz+9Ga0bG1u7vBghYr/fPC/nV+ztrm6wYYmK/wB48D86u2sNxccxRsV/vHgfnThk131rqc9rpttbRIoeONUZzzkgdq7W2u5bexggVVDRoFLdeQO1dfDqU9vYQQRIoaNApc88gdq8Mn/Z30rWfG2ta/4m1O4uYr69kuUsrYeUqqxyA78sfwxWzoUss1kXmcu+88mtHTJHkty0jFm3Hk1raJLJNZl5mLPvPJrwn9pPw/pXhj4ixaboNjDY2KafCwiiHBYs+SSeSTgcnnitCrdX68qoooooooooooooooq3af6tv97+goooqpRRRRRRRRRRRRRRRRRRRRRRRRRRRXu/wp+DGkeKPBNvqXiDU7qw1TVpZo9IhR1VZQiE7mBUk8qx4I+Ue9FFFeH3trPY3k9peRmK5t5GilQ9VdSQw/MGiiivXvgN8LNH+IujeIJ9VvryzubOSOK3eF1CbnU4Lgg55xwCPSiiivMPFXh/UPC3iC90bWIfKvbR9jjsw7Mp7qRyDRRRXU/Bv4dz/EHxKbeV3ttFs182/uxgeWnZVJ43Ng9egBPaiiiovjV4RsPA3xAu9D0qW5ltIYYpA9ywZ8suTkgAY/Ciiiuk8N/CvStP8M2viX4n662g6bdjdaWMKbru5XGcgYOARg9DwRnFFFFW4tJ+CGsSCzstd8S6NcP8qXV9GGhz/tfLwPqV+tFFFcN8S/AGqeAdXitdRaK5s7lPNs76DmK4T1HoRkZHuDyDmiiiu38LeBfAcfwo03xf41vtegN3eSWm2w2Mu4F8fKUJ6Iec0UUVEmmfA6ZhGNe8X25bgSywKVT3OI84ooorlfir4Al8CatZLFfR6no+ow/abC+jGBLHxwR0yMjpwQQfYFFFWvHHgvTtB+GvgfxBZzXT3uuRyPcpKymNSoGNgABHXuTRRRXntFFFen/BfwV4e8V2nim+8VXOo29lotol0TYsu4qd+7IKnPCDAFFFFaf2D4Gf9Bnxl/35X/43RRRWD41tvhhBo6v4Ov8AxHd6mJkzFfIqRmPPz/MEGDjp/Kiiirvj34e6XB4H0vxp4Fuby90CYeVex3TK81lNnGH2gDGTt6cHB6MKKKK5X4deDdR8deKrXRdMUqZDvnnIysEQPzOf5AdyQKKKKm+J+n+GdI8VXGm+Drm9vLG0/dS3VzKriWUH5tm1R8o6Z5yc9sVW1M4066/65P8A+gmoL/ixuP8Arm38jUGocWNx/wBc2/kaw/Dn/IxaT/1+Qf8Aoxa+c47j5Rz2rw5J/lHPavDEn+Uc9q/Scn5j9TXq3hzw9YJp1pdGHzZpYlkLSHdgkZ4HSvSdB0SySwtrkxeZLJGrlpPmwSM8DpXomiaLaLY21wYvMlkjVyz84JGeB0qZVGAe9bjQcYxxWwYuOlazQe1OqJoPamGKomg9qK2tFXZZkf7ZrR05dtvj/aNa+jrstCP9o18U/tcf8laH/YNg/wDQpKvVZq9XitFFFFFFFFFFFFFFFW7T/Vt/vf0FFFFVKKKKKKKKKKKKKKKKKKKKKKKK1fCuh3PiXxJpui2IP2i+nWBT/dBPLfQDJ/CiiivWvjZ41/sP4m6Dp3hlwlh4LWKC3RTw0q4MgP8AwEBD/wACoooqh+0lo1sPEuneLtHAOkeJ7VbxGXoJgo3j6kFT9d1FFFW/hO7xfAb4qSRsySILdlZTgqRyCD2NFFFbUUcfx88GwwiS3h+I2iIELyEIt/bZxuJ9s5Po3s9FFFUviJ4g0/wXpum/DHwdMHjiuYm1y/Xg3U5dd0efQcZHYAL2NFFFXPi1pMGuftWabpl4oa2uZbJZVPRlC7iPxAx+NFFFcF+0Hrl1rfxZ14XLt5NhMbG3j7RxpxgDtlsn8aKKK84ooor27S538S/sua3DqJ8yXwzqMT2UjclI3KDYD6YkcY9MelFFFb+ieDtT8a/szeH9O0aSzS4i1eadjdT+Uu0GUcHB5yw4ooorlrL9nnxdPdRxyX3h+FGYAv8Abi+P+Ahcn6UUUVL+0bKmkjwn4Kt4LzyfD1l5f2u5hMYuWYKC0eeqjb1HGTjtRRRR8Wf+SFfCX/rjP/JaKKK8Wooor3X9mnTJ9a8P/ErTLRoluLvSo4IzK21AzeaBk9hRRRWb/wAM7+Mv+fvw9/4MD/8AEUUUVxfxC+H2seApLFNbl0+Q3gcx/Y7jzcbdud3Ax94frRRRW78C/Gcvh7xL/Y15aPqega6wsr3Twu/eX+UOq92GcEdx9BRRRXpXxWgtPgj4Nk8OeEYrsX/iKSRp9VlXDJbqcCFG/vAMB9CzdSMFFFfNP06VHdRefbSwk7fMQrn0yMUy4j86CSPON6lc+mRTLiPzoJIs43qVz6ZGKsafc/YtQtboKHMEyTbScbtrBsZ/CuDi0Hwl4TjWTUpEuLpRkeed7E+0Y4/SuPj0bw14bRXvpEnuFHHnHex+iD/CuOj0bw14bRXvpEnuFGR5x3sfog/wr3Gbxr8XPixJJB4btbix0yQkE2CmCIA/37huT+BH0rsLQx3dnBcwKRFMiugIwQCMjiuotmS5tYZ4QRHIgdQRjAIyK6a38u5tYp4VIjlQOoIxgEccV9X+DNPudJ8I6Lp98yvd2tlDBMysWBdUAYgnk8g805oPanGOlaH2rYqJoPaozHUTQ+1FW7FdkOPc1Ythtjx71bsl2Q49zXxT+1x/yVof9g2D/wBCkqxUtT14rRRRRRRRRRRRRRRRVu0/1bf739BRRRVSiiiiiiiiiiiiiiiiiiiiiiivcP2era38MaL4o+JOqRB4NHtza2KNx5tw4GQD+KL/AMDNFFFUrj406fcXEk9x8NfCUs8jF5JHjyzsTkkkrySaKKK6+HXbb4y/CTxDolrotjpOreHwuoafaWX3GQZ3BRjjPzqQO7LRRRXLfCs5+APxXI6FLf8AlRRRXk2iaxqGg6tDqWjXctnfQk+XNEcMuQQfzBNFFFR6YzPrFkzsWZrmMlmOSSZBkk+tFFFeyftBaxN4f/aKXWLZd01gLO4Vf721ckfiMj8aKKKPjd4Jm8Q3n/CwfBEMmq6BrCLPOLZS8lrNgBw6DnHHPocg9qKKK8j0jw9rOsX6WWl6VfXd052iOKBic+/GB9TiiiivYPiHDB8NPhBbeAnuIpvEmr3C6hqqxNuFugwVQn/gKAeuGPQiiiioNYt5bn9lLw0kEMkzDXZCVjQucfvucAUUUV49HpWoF1EenXu/PG22fOfyooor2/4jQajb/s5eFYvGayJ4gXUm+wrdf8fC22GyGzzjG3r/ALGaKKKp/FG1uLr4FfCgW1vNMVgnLeVGz44XrgUUUV47/ZWo/wDQOvv/AAGk/wAKKKK9d+AkUh8GfFeIRyGX+xguzad2cTcY659qKKK8i/srUf8AoH33/gNJ/hRRRUdxZXdvH5lzaXMMYON8sLIPzIxRRRXt/gXTrX4R+Bx488QW6SeJ9SQxaDYSjmNSOZmHUcHPspA6twUUVH8MvF0HxC0698AfEK9eZtSla40vU5Tl7e7JJ25PYknA6clehGCiivIvFnh7UfCviG90bWYfKvbV9rY+64/hdT3UjkGoL8kWNwVJBEbYI+hqG8JFpOQSDsbBH0qG8JFpOQSDsbBH0qDw8qv4g0tHUMjXcIKkZBBkXIIr5+eItlmJLEZJPJNeMPGWyzZLHqTyTXizxlss2Sx6k8k1+k8cSRRrHEipGnCqowFHoB2r3fw78vh/Tc9raP8A9BFev6Hxotj7QJ/6CK9h0PjRbD2gT/0EVZX7o+lUNZ8W6Rpm5ZLgTzD/AJZQfOfxPQfnVPVPEumafuV5vOlH/LOH5j+J6CqWq+JdM0/KvN50o/5Zw/MfxPQUjMBWppVymoabbXgjKCeMSBSc4yOlaOnXC3tjBchCglQOFJzjNaOnTrfWNvchCglQOFJzjNfJ3xj+Pfimz8T6z4f8PpbaXDY3MlqblV82aTacZBb5V/In3q4AAOOKsjjpVoADpXz7q2p3+sX0l7q15cXt3J9+a4kLufxP8qKKKp0UUUUUUUUUUUUUUVbtP9W3+9/QUUUVUooooooooooooooooooooooorobjxhrM/gy28KvcRrodvMbhYEiVS0mSdzMOW5Y9fb0FFFFc9RRRW74N8V6x4N1kar4euhbXnltEWZA6sjYyCp4PQH8KKKKksPGOs2Gia7pFnPDFp+tsGvYhCvzkHI2n+Ec9BRRRXP0UUU6GRoZo5Yzh42DqfQg5H8qKKK1/F/ibVPF+uy6vr06T38qKjOkYjBCjA4HHSiiirXg3xv4j8GXDy+G9VnshIcyRDDxSH1ZGyCffGaKKK7HUfj98Qr20eAavBahxhpLa0RH/AAY5x+FFFFeYXdzPeXMtzdzSz3ErF5JZXLO7HqSTyTRRRXc+EPi74y8IaHFpGg6jBBYRMzqj2schBY5PJGepooorZf8AaC+I7KR/bNsue4sYs/yooorz7xN4k1nxRqX2/wAQajcX91jaHlbhV9FA4UewFFFFdh4c+NPjjw7odnpGk6nbxWFpGIoUa0jcqv1IyetFFFaX/DQnxG/6DFr/AOAMX+FFFFcz4Y+JnijwzrOsaro99FDfatJ5t2726OHbczZAIwOXbp60UUV03/DQnxG/6DFr/wCAMX+FFFFZHiX4w+MvE1lBZ65fWl3aw3EdysTWUYUuhyu4Acj2PBooornPGfi7W/GerLqPiK8N1cpGIkwgREQdlUcDnk+tFFFYKsyMGRirKcgg4IPYg0UUV0fjPxrrnjN7KTxFcQ3c9nF5Mc4gVJCnozAZbnnnuT61Bfc2Vx/1zb+RqK7/AOPWb/cb+VRXn/HpN/uN/Kszw3/yMek/9fkH/oxa8RMHyjjtXkxh4HHavJTDwPpX6WY5P1q5eanqF1ax20t1J9njQIsSnauAMDIHX8atXV/e3FukEk7+SihBGvyjA45x1/GrV1f3txbpBJcP5CKEEanauAO+Ov40HOKz4LCa5lEVtC8sh6LGuTVKGzluJBHBE8jn+FFzVKGzluJBHBE8jn+FFzWfrOradolk95rF9bWNqvWW4lEa/mete0+HoJLXQ7CCdCkscKqynsQOleqaLC9vpFnDKu2RIlVlPY4r1XRIXt9Is4ZV2yJEqsvocV+e/wATNRtdW+IfiXUdOmWeyutQmmhlUEB0LcEZrQq7V2uaoooooooooooooooooooq3af6tv8Ae/oKKKKqUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUVpWehave26z2Wk6hcQNnbJDbO6nBwcEDFFFFTf8Iv4g/6AWrf+AUv/wATRRRSf8Ixr/8A0A9V/wDAOT/4miiij/hGte/6Amq/+Acn/wATRRRSf8I3rn/QF1T/AMBJP8KKKKT/AIRzW/8AoDan/wCAkn+FFFFJ/wAI9rX/AEB9S/8AAST/AAooopP+Ef1n/oEal/4Cyf4UUUUf2BrH/QJ1H/wFf/Ciiik/sLV/+gVqH/gM/wDhRRRSf2Hq3/QLv/8AwGf/AAqG8/49J/8Acb+VR3X/AB7S/wC4f5VHdf8AHtL/ALh/lWh4d0bVF8Q6UzabfKBeQkk27gAeYvtXmmn+H76/CmKArGf45PlH/wBeuDs9Fu7wAxRFUP8AG/yiuDs9Fu7wAxxFUP8AG/yivt7xt8XvBng/zItR1aO4vk/5c7L99Ln0OOF/4ERXS6d4KtIsNfSNcN/cX5V/xNbtl4Vto8Ndu0zf3V+Vf8a3bLwrbR4a8dpm/uj5V/xNeAeNv2mNe1HzIPCthBpFueBPNiec+4H3F/Jq6a0tLe0iEdrDHEnoi4retraG2j2W8SRp6KMVvW1tDbR7LeJI09FGK8Q13W9U1+9N5reoXWoXJ/5aXMpcj6Z4A9hipqlqWs6iiiiiiiiiiiiiiiiiiiiiiirdp/q2/wB7+goooqpRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRT1lkUYWSRR6BiBRRRS+fN/z2l/77P+NFFFHnzf89pf++zRRRR50v8Az1l/77NFFFHnS/8APWT/AL7NFFFHnS/89ZP++zRRRR50v/PWT/vs0UUUebL/AM9ZP++zRRRSebJ/z0k/77NFFFHmyf8APST/AL6NFFFHmyf89JP++jRRRR5sn/PR/wDvo0UUUzp0oooooooooooooooooooooooooooooooooooq3af6tv8Ae/oKKKKqUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUVbtP9W3+9/QUUUVUoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooq3af6tv97+goooqpRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRVu0/wBW3+9/QUUUVF5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFHkf7X6UUUUeR/tfpRRRR5H+1+lFFFW7SD923zfxensK//Z";
const card = { background:"#fff", borderRadius:12, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", border:"1px solid #f0ebe3", marginBottom:12 };
const inp = { padding:"8px 10px", borderRadius:7, border:"1.5px solid #e0d8cc", fontSize:13, fontFamily:"'DM Sans',sans-serif", background:"#faf8f5", color:D, outline:"none", width:"100%", boxSizing:"border-box" };
const sel = { ...inp, cursor:"pointer" };
const btnG = { padding:"8px 16px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${G},#e8c47c)`, color:D, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const btnO = { padding:"6px 14px", borderRadius:7, border:`1.5px solid ${G}`, background:"transparent", color:G, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const btnD = { padding:"4px 10px", borderRadius:6, border:"none", background:"#fee2e2", color:"#dc2626", fontSize:13, cursor:"pointer" };
const lbl = { fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1, color:"#8a7d6b", marginBottom:2, display:"block" };
const badge = (e) => ({ display:"inline-block", padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:600, background:e==="Aprobado"?"#dcfce7":e==="Rechazado"?"#fee2e2":"#fef9c3", color:e==="Aprobado"?"#16a34a":e==="Rechazado"?"#dc2626":"#a16207" });
const AMB_ICONS = {cocina:"🍳",placard:"👔",vanitory:"🚿",lavadero:"🧺",living:"🛋️",dormitorio:"🛏️",escritorio:"💻",otro:"📦"};
const AMB_LABELS = {cocina:"Cocina",placard:"Placard",vanitory:"Vanitory",lavadero:"Lavadero",living:"Living",dormitorio:"Dormitorio",escritorio:"Escritorio",otro:"Otro"};
const ambBadge = (a) => ({display:"inline-block",padding:"2px 8px",borderRadius:8,fontSize:9,fontWeight:600,background:"#e0e7ff",color:"#3730a3"});

/* ═══════════════════════════════════════════════════════
   5b. USUARIOS
   ═══════════════════════════════════════════════════════ */

const USERS = [
  { id:"guille", nombre:"Guille", rol:"admin", pin:"Mdfaglomerado$6419" },
  { id:"manu", nombre:"Manu", rol:"admin", pin:"Gaudi$2829" },
  { id:"florS", nombre:"Flor S", rol:"vendedora", pin:"Grafito$3435" },
  { id:"florP", nombre:"Flor P", rol:"vendedora", pin:"Grafito$3435" },
];

const Sec = ({icon,title,right})=>(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,marginTop:22}}>
    <span style={{fontSize:18}}>{icon}</span>
    <h2 style={{margin:0,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:D}}>{title}</h2>
    <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G},transparent)`,marginLeft:8}}/>
    {right}
  </div>
);

const fmtNum = (n) => { if(!n && n!==0) return ""; const v = Math.abs(n); const [int,dec] = v.toFixed(2).split("."); const thousands = int.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return (n<0?"-":"")+"$"+thousands+","+dec; };

const MoneyInput = ({value,onChange,style,placeholder})=>{
  const [editing,setEditing] = useState(false);
  const [raw,setRaw] = useState("");
  const stl = style||{width:100,padding:"4px 7px",borderRadius:5,border:"1.5px solid #e0d8cc",fontSize:12,textAlign:"right",fontFamily:"'DM Sans',sans-serif",background:"#faf8f5"};
  if(!editing) return <input style={stl} value={fmtNum(value)} readOnly placeholder={placeholder||"$0,00"}
    onFocus={()=>{setEditing(true);setRaw(value?String(value).replace(".",","):"");}}/>;
  return <input autoFocus style={{...stl,borderColor:G}} value={raw} placeholder="0"
    onChange={e=>{
      const v=e.target.value;
      // Allow digits, one comma, minus
      const clean=v.replace(/[^0-9,\-]/g,"");
      setRaw(clean);
      const num=parseFloat(clean.replace(",","."));
      onChange(isNaN(num)?0:num);
    }}
    onBlur={()=>setEditing(false)}
    onKeyDown={e=>{if(e.key==="Enter"){e.target.blur();}}}
  />;
};

const PRow = ({label,k,precios,setP})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f5f0e8"}}>
    <span style={{fontSize:12,color:"#4a4a4a"}}>{label}</span>
    <MoneyInput value={precios[k]||0} onChange={v=>setP(k,v)} />
  </div>
);

const FRow = ({label,children})=>(
  <div><label style={lbl}>{label}</label>{children}</div>
);

/* ═══════════════════════════════════════════════════════
   6. APP
   ═══════════════════════════════════════════════════════ */

export default function App() {
  const [user, setUser] = useState(null);
  const [loginPin, setLoginPin] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginUser, setLoginUser] = useState(null);
  const [view, setView] = useState("clientes");
  const [ready, setReady] = useState(false);
  const [precios, setPrecios] = useState(defPrecios);
  const [accesorios, setAccesorios] = useState(ACCESORIOS_INIT);
  const [clientes, setClientes] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [cliId, setCliId] = useState(null);
  const [preId, setPreId] = useState(null);
  const [search, setSearch] = useState("");
  const [catSel, setCatSel] = useState("bm");
  const [expandedMod, setExpandedMod] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [dailyMsg, setDailyMsg] = useState(null);
  // Daily motivational messages
  useEffect(()=>{
    if(!user) return;
    const key = `v2hello_${user.id}_${new Date().toISOString().slice(0,10)}`;
    try { if(localStorage.getItem(key)) return; localStorage.setItem(key,"1"); } catch(e){}
    const hora = new Date().getHours();
    const saludo = hora<12?"Buenos días":hora<18?"Buenas tardes":"Buenas noches";
    const frases = [
      "Cada presupuesto es una oportunidad. ¡Hacelo brillar!",
      "Un gran diseño empieza con una gran actitud. ¡Vamos!",
      "Hoy es un excelente día para cerrar una venta.",
      "Tu próximo cliente puede ser el proyecto del año.",
      "La calidad de tu atención define el éxito. ¡Dale con todo!",
      "Cada detalle cuenta. Los clientes lo notan.",
      "No vendemos muebles, vendemos el hogar de sus sueños.",
      "La perseverancia abre todas las puertas. ¡Literalmente!",
      "Un buen presupuesto es el primer paso de un gran proyecto.",
      "Hoy vas a sorprender a alguien con tu trabajo.",
      "El éxito no se espera, se construye. Módulo a módulo.",
      "Tu talento + esta herramienta = resultados increíbles.",
    ];
    const frase = frases[Math.floor(Math.random()*frases.length)];
    setDailyMsg({saludo, nombre:user.nombre.split(" ")[0], frase});
  },[user]);
  const [preciosUpd, setPreciosUpd] = useState("");
  const [backups, setBackups] = useState([]);
  const [auditLog, setAuditLog] = useState(()=>{ try{return JSON.parse(localStorage.getItem("v2audit")||"[]");}catch(e){return [];} });
  const [papelera, setPapelera] = useState(()=>{ try{return JSON.parse(localStorage.getItem("v2papelera")||"[]");}catch(e){return [];} });
  useEffect(()=>{ try{localStorage.setItem("v2papelera",JSON.stringify(papelera));}catch(e){} },[papelera]);
  const addLog = useCallback((accion, detalle, quien)=>{
    const entry = {id:uid(), ts:new Date().toISOString(), usuario:quien||user?.nombre||"Sistema", accion, detalle};
    setAuditLog(prev=>{const n=[entry,...prev].slice(0,500); try{localStorage.setItem("v2audit",JSON.stringify(n));}catch(e){} return n;});
  },[user]);
  const [showBackups, setShowBackups] = useState(false);
  const [bkMsg, setBkMsg] = useState("");
  const [toast, setToast] = useState(null); // {msg, type:"error"|"ok"|"warn"}
  const showToast = useCallback((msg, type)=>{ setToast({msg,type:type||"warn"}); setTimeout(()=>setToast(null), 4000); },[]);
  const [csvModal, setCsvModal] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [ocSel, setOcSel] = useState([]);
  const [manPres, setManPres] = useState([]);
  const [manId, setManId] = useState(null);
  const [approveModal, setApproveModal] = useState(null); // {preId, colors}
  const [pagos, setPagos] = useState([]); // [{id,preId,clienteId,fecha,monto,tipo,nota}]
  const [ocChecked, setOcChecked] = useState({}); // {itemKey: true}
  const [planEdits, setPlanEdits] = useState({}); // {preId: {boards:{nom:{placas,nombre}}, cantos:{nom:{ml,nombre}}}}
  const updPlanEdit = (preId, section, key, field, val) => {
    setPlanEdits(prev => {
      const pe = {...prev};
      if(!pe[preId]) pe[preId] = {};
      if(!pe[preId][section]) pe[preId][section] = {};
      if(!pe[preId][section][key]) pe[preId][section][key] = {};
      pe[preId][section][key][field] = val;
      return pe;
    });
  };
  const [ipcState, setIpcState] = useState({loading:false, result:null, error:null});
  const [pagoForm, setPagoForm] = useState({preId:"",monto:0,tipo:"Efectivo",nota:""});
  const imgRefs = useRef({});
  const fileRef = useRef(null);
  const printRef = useRef(null);

  // Load / Save
  useEffect(() => { let ok=true; (async()=>{ const d=await Promise.all([sGet("v2pr3",defPrecios),sGet("v2ac",ACCESORIOS_INIT),sGet("v2cl",[]),sGet("v2ps",[]),sGet("v2pu",""),sGet("v2bk",[]),sGet("v2man",[]),sGet("v2pag",[]),sGet("v2ock",{})]); if(ok){setPrecios({...defPrecios,...(d[0]||{})});setAccesorios(d[1]);setClientes(d[2]);setPresupuestos(d[3]);setPreciosUpd(d[4]);setBackups(d[5]);setManPres(d[6]);setPagos(d[7]);setOcChecked(d[8]);setReady(true);} })(); return()=>{ok=false;}; }, []);
  useEffect(() => { if(ready) sSet("v2pr3",precios); }, [precios,ready]);
  useEffect(() => { if(ready) sSet("v2ac",accesorios); }, [accesorios,ready]);
  useEffect(() => { if(ready) sSet("v2cl",clientes); }, [clientes,ready]);
  useEffect(() => { if(ready) sSet("v2ps",presupuestos); }, [presupuestos,ready]);
  useEffect(() => { if(ready) sSet("v2pu",preciosUpd); }, [preciosUpd,ready]);
  useEffect(() => { if(ready) sSet("v2bk",backups); }, [backups,ready]);
  useEffect(() => { if(ready) sSet("v2man",manPres); }, [manPres,ready]);
  useEffect(() => { if(ready) sSet("v2pag",pagos); }, [pagos,ready]);
  useEffect(() => { if(ready) sSet("v2ock",ocChecked); }, [ocChecked,ready]);
  // Auto-backup to localStorage as redundancy
  useEffect(() => {
    if(!ready) return;
    try {
      const backup = JSON.stringify({precios,clientes,presupuestos,manPres,pagos,accesorios,ocChecked,preciosUpd,papelera,version:"v2",fecha:new Date().toISOString()});
      localStorage.setItem("v2_autobackup", backup);
    } catch(e) { /* localStorage full or unavailable */ }
  }, [precios,clientes,presupuestos,manPres,pagos,ready]);

  // Derived
  const cli = clientes.find(c=>c.id===cliId);
  const pre = presupuestos.find(p=>p.id===preId);
  const cliPres = useMemo(()=>presupuestos.filter(p=>p.clienteId===cliId),[presupuestos,cliId]);
  const filtClis = useMemo(()=>search?clientes.filter(c=>(c.nombre||"").toLowerCase().includes(search.toLowerCase())):clientes,[clientes,search]);

  const preTots = pre ? calcPresupTotal(pre, precios, accesorios) : null;

  // Navigation
  const goList = ()=>{ setView("clientes"); setCliId(null); setPreId(null); };
  const goCli = (id)=>{ setCliId(id); setPreId(null); setView("editCli"); };
  const goPre = (id)=>{ setPreId(id); setView("editPre"); };

  // CRUD
  const newCli = ()=>{ const c={id:uid(),nombre:"",telefono:"",email:"",direccion:"",notas:"",creado:new Date().toISOString().slice(0,10)}; setClientes(p=>[...p,c]); goCli(c.id); };
  const updCli = (id,k,v)=>setClientes(p=>p.map(c=>c.id===id?{...c,[k]:v}:c));
  const delCli = (id)=>{
    const cli_ = clientes.find(c=>c.id===id);
    const presups = presupuestos.filter(x=>x.clienteId===id);
    const cn = cli_?.nombre||"";
    // Move to papelera
    setPapelera(prev=>[{tipo:"cliente",fecha:new Date().toISOString(),borradoPor:user?.nombre||"",cliente:cli_,presupuestos:presups},...prev].slice(0,50));
    addLog("Eliminar cliente → papelera",cn);
    setClientes(p=>p.filter(c=>c.id!==id));
    setPresupuestos(p=>p.filter(x=>x.clienteId!==id));
    goList();
  };

  const newPre = (cid, tipo)=>{ const n=presupuestos.filter(p=>p.clienteId===cid).length+1; const p={id:uid(),clienteId:cid,numero:n,tipo:tipo||"modular",ambiente:"cocina",fecha:new Date().toISOString().slice(0,10),estado:"Pendiente",creadoPor:user?.nombre||"",filtros:{...defFiltros},modulos:[],accCant:{},piezasManuales:[],estFlotantes:[],tapasTerminacion:[],metrosLed:0,kmEnvio:0,itemsExtra:[],observaciones:"",colorSpec:""}; setPresupuestos(prev=>[...prev,p]); goPre(p.id); };

  // ══ KITCHEN WIZARD: auto-generate modules from survey ══
  const wizardGenerate = (w) => {
    const d = w.data;
    const tipo = w.tipo || "modular";
    const n = presupuestos.filter(p=>p.clienteId===w.cliId).length+1;
    const mods = [];
    const addM = (modId, ancho, qty, ov_) => { for(let i=0;i<(qty||1);i++) mods.push({uid:uid(),modId,ancho:parseInt(ancho),cantidad:1,altoBasc:undefined,ov:ov_||{}}); };

    // Parse tramos
    const tramos = [];
    if(d.layout==="lineal") tramos.push(d.tramo1||0);
    else if(d.layout==="L") { tramos.push(d.tramo1||0); tramos.push(d.tramo2||0); }
    else { tramos.push(d.tramo1||0); tramos.push(d.tramo2||0); tramos.push(d.tramo3||0); }
    const totalMM = tramos.reduce((s,t)=>s+t*1000,0);

    // Track piso-a-techo (torre, despensero) → excluded from BOTH BM and AL
    let pisoATechoMM = 0;
    if(d.torre) pisoATechoMM += 600;
    if(d.despensero) pisoATechoMM += (d.anchoDespensero||400);
    if(d.arribaHeladera) pisoATechoMM += 950; // heladera va de piso a altura alacenas, sin BM ni AL

    // ── BM distribution (excluye torre/despensero que son piso a techo) ──
    if(d.bajomesada) {
      let remaining = totalMM - pisoATechoMM;
      const isL = d.layout==="L", isU = d.layout==="U";

      if(isL) { addM("bm2","1000"); remaining -= 1000; }
      if(isU) { addM("bm2","1000"); addM("bm2","1000"); remaining -= 2000; }

      if(d.fregadero) { addM("bm3","800"); remaining -= 800; }
      if(d.anafe) { remaining -= (d.anchoAnafe||600); }
      if(d.cajonera && remaining >= 600) { addM("bm4","600"); remaining -= 600; }

      while(remaining >= 600) {
        const w_ = remaining >= 1000 ? 800 : remaining >= 800 ? 800 : 600;
        addM("bm3", String(w_));
        remaining -= w_;
      }
      if(remaining >= 300) { addM("bm7", String(Math.min(600, Math.max(200, Math.round(remaining/100)*100)))); }
    }

    // ── Piso a techo: Torre horno (to1 = 2caj+1basc, NO lleva BM ni AL) ──
    if(d.torre) { addM("to1","600"); }

    // ── Piso a techo: Despensero (NO lleva BM ni AL arriba) ──
    if(d.despensero) { addM("de1", String(d.anchoDespensero||400)); }

    // ── Alacenas (excluye torre, despensero, campana — NO alacena donde hay piso-a-techo) ──
    if(d.alacenas) {
      let remaining = totalMM - pisoATechoMM;
      const isL = d.layout==="L", isU = d.layout==="U";

      if(isL) { addM("al2","1000"); remaining -= 1000; }
      if(isU) { addM("al2","1000"); addM("al2","1000"); remaining -= 2000; }

      if(d.campana) remaining -= (d.anchoCampana||600);

      if(d.microondas && remaining >= 600) { addM("al8","600"); remaining -= 600; }

      while(remaining >= 600) {
        const w_ = remaining >= 1000 ? 800 : remaining >= 800 ? 800 : 600;
        if(d.tipoAlacena==="basculante" && w_ <= 1000) addM("al5", String(w_));
        else addM("al3", String(Math.min(1200,w_)));
        remaining -= w_;
      }
      if(remaining >= 300) { addM("al4", String(Math.min(600,Math.max(300,Math.round(remaining/100)*100)))); }
    }

    // ── Arriba heladera ──
    if(d.arribaHeladera) { addM("es1","950"); }

    // ═══ PLACARD / VESTIDOR GENERATION ═══
    if(d.ambiente==="placard"||d.ambiente==="vestidor") {
      const isL = d.layout==="L", isU = d.layout==="U";
      let remaining = totalMM;

      // Esquineros vestidor
      if(isL) { addM("pl8","1000"); remaining -= 1000; }
      if(isU) { addM("pl8","1000"); addM("pl8","1000"); remaining -= 2000; }

      // Distribute modules of max 1200mm
      const numMods = Math.ceil(remaining / 1200);
      const modW = Math.round(remaining / numMods / 100) * 100;
      const modWidths = [];
      let rem = remaining;
      for(let i=0; i<numMods; i++) {
        const w = i < numMods-1 ? Math.min(modW, 1200) : Math.min(rem, 1200);
        const wRound = Math.max(600, Math.round(w/100)*100);
        modWidths.push(wRound);
        rem -= wRound;
      }

      // Assign module types based on selections
      modWidths.forEach((w,i)=>{
        if(i===0 && d.plCajonera) addM("pl5", String(w));      // cajonera first
        else if(d.plBarraDoble && i===modWidths.length-1) addM("pl4", String(w)); // barra doble last
        else if(d.plBarraColgar && i > 0) addM("pl3", String(w)); // barra colgar
        else addM("pl1", String(w)); // estantes default
      });

      // Zapatero
      if(d.plZapatero) addM("pl7","800");
    }

    // Build filtros
    const filtros = {
      ...defFiltros,
      interior: d.placaInterior || "agloBlanco",
      puerta: d.placaPuerta || "agloBlanco",
      colorFondo: d.colorFondo || "blanco",
      apertura: d.apertura || "melamina",
      bisagra: d.bisagra || "comun",
      corredera: d.corredera || "comun",
      correderaMedida: d.correderaMedida || "50",
      colorHerraje: d.colorHerraje || "aluminio",
      rentabilidad: d.rentabilidad || 30,
      descInterior: d.descInterior || "",
      descPuerta: d.descPuerta || "",
      // Placard specific
      altoPlacard: d.altoPlacard || 2600,
      profExt: d.profExt || 600,
      profInt: d.profInt || 500,
      banquinaPlacard: d.banquinaPlacard || "material",
      kitPlacard: d.kitPlacard || "cl200",
      ledPlacardLat: !!d.ledPlacardLat,
    };

    // Build tapas
    const tapas = [];
    if(d.tapaBMIzq) tapas.push({uid:uid(),tipo:"bm",material:filtros.interior,canto:filtros.cantoFrontal||"blanco04",cantidad:1});
    if(d.tapaBMDer) tapas.push({uid:uid(),tipo:"bm",material:filtros.interior,canto:filtros.cantoFrontal||"blanco04",cantidad:1});
    if(d.tapaALIzq) tapas.push({uid:uid(),tipo:"al",material:filtros.interior,canto:filtros.cantoFrontal||"blanco04",cantidad:1});
    if(d.tapaALDer) tapas.push({uid:uid(),tipo:"al",material:filtros.interior,canto:filtros.cantoFrontal||"blanco04",cantidad:1});

    const pre_ = {
      id:uid(), clienteId:w.cliId, numero:n, tipo, ambiente:d.ambiente||"cocina",
      fecha:new Date().toISOString().slice(0,10), estado:"Pendiente",
      creadoPor:user?.nombre||"", filtros, modulos:mods,
      accCant:{}, piezasManuales:[], estFlotantes:[],
      tapasTerminacion:tapas, metrosLed:d.led?totalMM/1000:0, kmEnvio:0,
      itemsExtra:[], observaciones:d.notas||"",
      colorSpec: [d.descInterior?"Interior: "+d.descInterior:"",d.descPuerta?"Puertas: "+d.descPuerta:""].filter(Boolean).join("\n"),
      layoutCocina: { layout:d.layout, tramos, torre:!!d.torre, despensero:!!d.despensero, anchoDespensero:d.anchoDespensero||400, campana:!!d.campana, anchoCampana:d.anchoCampana||600, anafe:!!d.anafe, anchoAnafe:d.anchoAnafe||600, fregadero:!!d.fregadero },
    };
    setPresupuestos(prev=>[...prev, pre_]);
    goPre(pre_.id);
    setWizard(null);
  };
  const updPre = (id,u)=>setPresupuestos(p=>p.map(x=>x.id===id?{...x,...u,ultimaMod:new Date().toISOString()}:x));
  const delPre = (id)=>{
    const p = presupuestos.find(x=>x.id===id);
    const cn = clientes.find(c=>c.id===p?.clienteId)?.nombre||"";
    setPapelera(prev=>[{tipo:"presupuesto",fecha:new Date().toISOString(),borradoPor:user?.nombre||"",presupuesto:p,clienteNombre:cn},...prev].slice(0,50));
    addLog("Eliminar presupuesto → papelera",`#${p?.numero||"?"} de ${cn}`);
    setPresupuestos(pp=>pp.filter(x=>x.id!==id));
    if(preId===id) setPreId(null);
  };

  const setP = (k,v)=>{setPrecios(p=>({...p,[k]:k==="direccionOrigen"?v:(typeof v==="number"?v:(parseFloat(v)||0))})); setPreciosUpd(new Date().toLocaleString("es-AR"));};

  // Approval flow: validate client data, ask for installation date
  const handleEstado = (preId, nuevoEstado)=>{
    const pre_ = presupuestos.find(p=>p.id===preId);
    // If changing FROM Aprobado, only Guille can
    if(pre_?.estado==="Aprobado" && user?.id!=="guille") {
      showToast("Solo Guille puede modificar un presupuesto aprobado","error");
      return;
    }
    if(nuevoEstado==="Aprobado") {
      const cl_ = clientes.find(c=>c.id===pre_?.clienteId);
      const falta = [];
      if(!cl_?.nombre) falta.push("Nombre y Apellido");
      if(!cl_?.telefono) falta.push("Teléfono");
      if(!cl_?.direccion) falta.push("Dirección");
      if(falta.length > 0) {
        showToast("Para aprobar completá: " + falta.join(", "),"error");
        return;
      }
      setApproveModal({preId, fechaInstalacion:""});
    } else {
      updPre(preId, {estado:nuevoEstado});
    }
  };
  const confirmApprove = ()=>{
    if(!approveModal) return;
    if(!approveModal.fechaInstalacion) { showToast("Ingresá la fecha de instalación","error"); return; }
    // Snapshot precios al momento de aprobación
    updPre(approveModal.preId, {
      estado:"Aprobado",
      fechaAprobado:new Date().toISOString().slice(0,10),
      fechaInstalacion:approveModal.fechaInstalacion,
      preciosSnapshot:{...precios}
    });
    const p_=presupuestos.find(x=>x.id===approveModal.preId); const cn_=clientes.find(c=>c.id===p_?.clienteId)?.nombre||"";
    addLog("Aprobar presupuesto",`#${p_?.numero||"?"} de ${cn_} — Instalación: ${approveModal.fechaInstalacion}`);
    setApproveModal(null);
  };

  // Duplicar presupuesto con precios actualizados
  const duplicarConPreciosNuevos = (preId)=>{
    const orig = presupuestos.find(p=>p.id===preId);
    if(!orig) return;
    
    const n = presupuestos.filter(p=>p.clienteId===orig.clienteId).length + 1;
    const dup = {
      ...JSON.parse(JSON.stringify(orig)),
      id: uid(),
      numero: n,
      fecha: new Date().toISOString().slice(0,10),
      estado: "Pendiente",
      fechaAprobado: "",
      fechaInstalacion: "",
      preciosSnapshot: null,
      creadoPor: user?.nombre||"",
      duplicadoDe: orig.numero
    };
    setPresupuestos(prev=>[...prev, dup]);
    setPreId(dup.id);
    setView("editPre");
  };

  // Duplicar presupuesto Promob con precios actualizados
  const duplicarPromob = (manId_)=>{
    const orig = manPres.find(m=>m.id===manId_);
    if(!orig) return;
    
    // Rebuild items with current prices
    const buildItems_ = ()=>{
      const items = [];
      CATALOGO.forEach(grp=>grp.items.forEach(([k,label])=>{
        const origItem = (orig.items||[]).find(it=>it.key===k);
        items.push({uid:uid(),key:k,descripcion:label,precio:precios[k]||0,cantidad:origItem?.cantidad||0,cat:grp.cat});
      }));
      accesorios.forEach(a=>{
        if(a.precio>0) {
          const origItem = (orig.items||[]).find(it=>it.key==="acc_"+a.id);
          items.push({uid:uid(),key:"acc_"+a.id,descripcion:a.nombre,precio:a.precio,cantidad:origItem?.cantidad||0,cat:"Accesorios"});
        }
      });
      return items;
    };
    const dup = {
      ...JSON.parse(JSON.stringify(orig)),
      id: uid(),
      fecha: new Date().toISOString().slice(0,10),
      estado: "Pendiente",
      creadoPor: user?.nombre||"",
      items: buildItems_(),
      extras: JSON.parse(JSON.stringify(orig.extras||[])).map(e=>({...e,uid:uid()})),
      duplicadoDe: orig.fecha
    };
    setManPres(prev=>[...prev, dup]);
    setManId(dup.id);
  };

  // Pagos
  const addPago = (clienteId, preId, monto, tipo, nota)=>{
    const now = new Date();
    const p = {id:uid(), clienteId, preId, fecha:now.toISOString().slice(0,10), hora:now.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}), monto:parseFloat(monto)||0, tipo, nota};
    setPagos(prev=>[...prev,p]);
  };
  const delPago = (pagoId)=>setPagos(prev=>prev.filter(p=>p.id!==pagoId));

  // IPC Calculation via AI + web search
  const calcIPC = async (fechaDesde, fechaHasta, saldoActual)=>{
    if(!fechaDesde || !fechaHasta || saldoActual<=0) { setIpcState({loading:false,result:null,error:"Completá ambas fechas y verificá que haya saldo pendiente"}); return; }
    setIpcState({loading:true, result:null, error:null});
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5-20250929",
          max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Necesito calcular el ajuste por IPC (Índice de Precios al Consumidor) de Argentina entre ${fechaDesde} y ${fechaHasta}.

Buscá el IPC acumulado de Argentina entre esas dos fechas. Si no encontrás el dato exacto entre esas fechas, calculá un proporcional basado en los últimos datos mensuales disponibles del INDEC.

IMPORTANTE: Respondé SOLO con un JSON así (sin markdown, sin backticks):
{"porcentaje": 5.2, "detalle": "IPC acumulado mar-jun 2025: 5.2% (fuente: INDEC)", "fechaDesde": "${fechaDesde}", "fechaHasta": "${fechaHasta}"}

El porcentaje debe ser el número sin el símbolo %. Si no podés calcular el dato exacto hacé tu mejor estimación proporcional basada en datos mensuales.`}]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.type==="text"?b.text:"").filter(Boolean).join("") || "";
      const clean = text.replace(/```json|```/g,"").trim();
      let parsed;
      try { parsed = JSON.parse(clean); } catch(e) {
        // Try to extract percentage from text
        const match = text.match(/(\d+[.,]\d+)\s*%/);
        if(match) {
          parsed = {porcentaje: parseFloat(match[1].replace(",",".")), detalle: text.slice(0,200)};
        } else {
          throw new Error("No se pudo interpretar la respuesta");
        }
      }
      const pct = parseFloat(parsed.porcentaje) || 0;
      const ajuste = saldoActual * (pct/100);
      setIpcState({loading:false, error:null, result:{
        porcentaje: pct,
        detalle: parsed.detalle || "",
        ajuste: Math.round(ajuste),
        saldoBase: saldoActual,
        fechaDesde, fechaHasta
      }});
    } catch(err) {
      setIpcState({loading:false, result:null, error:"Error al consultar IPC: "+err.message});
    }
  };

  // Backup functions
  const doBackup = ()=>{
    const data = { precios, accesorios, clientes, presupuestos, manPres, pagos, ocChecked, preciosUpd, papelera, fecha: new Date().toISOString(), version:"v2" };
    const entry = { id:uid(), fecha:new Date().toLocaleString("es-AR"), nClientes:clientes.length, nPresup:presupuestos.length };
    setBackups(prev=>[entry,...prev].slice(0,20));
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_amoblex_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
      setBkMsg("✅ Backup descargado"); setTimeout(()=>setBkMsg(""),3000);
    } catch(err) {
      // Fallback: save to storage + copy to clipboard
      try {
        const json = JSON.stringify(data);
        navigator.clipboard.writeText(json).then(()=>{
          setBkMsg("📋 Copiado al portapapeles (pegá en un archivo .json)"); setTimeout(()=>setBkMsg(""),5000);
        }).catch(()=>{
          setBkMsg("⚠ No se pudo descargar. Usá '☁️ Guardar en Storage' como alternativa"); setTimeout(()=>setBkMsg(""),5000);
        });
      } catch(e2) {
        setBkMsg("⚠ Error: " + err.message + ". Usá Storage."); setTimeout(()=>setBkMsg(""),5000);
      }
    }
    addLog("Backup descargado","Archivo JSON");
  };
  const doRestore = (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try {
        const data = JSON.parse(ev.target.result);
        if(!data.precios || !data.version) { setBkMsg("Archivo inválido"); setTimeout(()=>setBkMsg(""),3000); return; }
        
        setPrecios({...defPrecios, ...(data.precios||{})});
        setAccesorios(data.accesorios || ACCESORIOS_INIT);
        setClientes(data.clientes || []);
        setPresupuestos(data.presupuestos || []);
        setManPres(data.manPres || []); setPagos(data.pagos || []); setOcChecked(data.ocChecked || {});
        setPreciosUpd(data.preciosUpd || "");
        clearCache(); addLog("Backup restaurado",`Archivo: ${file.name}`);
        setBkMsg("Backup restaurado correctamente"); setTimeout(()=>setBkMsg(""),4000);
      } catch(err) { setBkMsg("Error al leer: "+err.message); setTimeout(()=>setBkMsg(""),4000); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const doBackupStorage = async()=>{
    const data = { precios, accesorios, clientes, presupuestos, manPres, pagos, ocChecked, preciosUpd, papelera, fecha: new Date().toISOString(), version:"v2" };
    await sSet("v2backup_auto", data);
    const entry = { id:uid(), fecha:new Date().toLocaleString("es-AR"), nClientes:clientes.length, nPresup:presupuestos.length, tipo:"storage" };
    setBackups(prev=>[entry,...prev].slice(0,20));
    setBkMsg("Copia guardada en storage"); setTimeout(()=>setBkMsg(""),3000);
  };
  const doRestoreStorage = async()=>{
    const data = await sGet("v2backup_auto", null);
    if(!data) { setBkMsg("No hay copia en storage"); setTimeout(()=>setBkMsg(""),3000); return; }
    
    setPrecios({...defPrecios, ...(data.precios||{})});
    setAccesorios(data.accesorios || ACCESORIOS_INIT);
    setClientes(data.clientes || []);
    setPresupuestos(data.presupuestos || []);
    setManPres(data.manPres || []); setPagos(data.pagos || []); setOcChecked(data.ocChecked || {});
    setPreciosUpd(data.preciosUpd || "");
    clearCache(); setBkMsg("Restaurado desde storage"); setTimeout(()=>setBkMsg(""),3000);
  };

  // Excel precios export/import
  // CSV Export/Import
  const precioKeys = Object.keys(defPrecios);
  const buildCsv = ()=> precioKeys.map(k => k + "\t" + (precios[k]||0)).join("\n");
  const doCsvImport = ()=>{
    if(!csvText.trim()){ setBkMsg("Pegá el contenido"); setTimeout(()=>setBkMsg(""),2000); return; }
    const np = {...precios}; let c = 0;
    csvText.split("\n").forEach(ln=>{
      const sep = ln.includes("\t") ? "\t" : ln.includes(";") ? ";" : ",";
      const ps = ln.split(sep);
      const k = (ps[0]||"").trim();
      const v = parseFloat((ps[ps.length-1]||"").replace(",","."));
      if(k && k in np && !isNaN(v) && v >= 0){ np[k]=v; c++; }
    });
    if(c===0){ setBkMsg("No se encontraron precios"); setTimeout(()=>setBkMsg(""),3000); return; }
    setPrecios(np); setPreciosUpd(new Date().toLocaleString("es-AR"));
    setBkMsg(c+" precios importados"); setTimeout(()=>setBkMsg(""),3000);
    setCsvModal(null); setCsvText("");
  };

  // Pre helpers
  const f = {...defFiltros, ...(pre?.filtros || {})};
  const preGloss = f.puerta === "gloss";
  const setF = (k,v)=>{ const nf={...f,[k]:v}; if(k==="puerta"&&v==="gloss") nf.interior="agloBlanco"; updPre(pre.id,{filtros:nf}); };
  const addMod = (modId,ancho,altoBasc)=>updPre(pre.id,{modulos:[...(pre.modulos||[]),{uid:uid(),modId,ancho:parseInt(ancho),cantidad:1,altoBasc,ov:{}}]});
  const rmMod = (u)=>updPre(pre.id,{modulos:(pre.modulos||[]).filter(m=>m.uid!==u)});
  const setModQ = (u,c)=>updPre(pre.id,{modulos:(pre.modulos||[]).map(m=>m.uid===u?{...m,cantidad:Math.max(1,parseInt(c)||1)}:m)});
  const setModOv = (u,k,v)=>updPre(pre.id,{modulos:(pre.modulos||[]).map(m=>m.uid===u?{...m,ov:{...(m.ov||{}),[k]:v||undefined}}:m)});
  const setAccQ = (aid,c)=>updPre(pre.id,{accCant:{...(pre.accCant||{}),[aid]:Math.max(0,parseInt(c)||0)}});

  // Pieza manual
  const addPM = ()=>updPre(pre.id,{piezasManuales:[...(pre.piezasManuales||[]),{uid:uid(),largo:0,ancho:0,cantidad:1}]});
  const updPM = (u,k,v)=>updPre(pre.id,{piezasManuales:(pre.piezasManuales||[]).map(p=>p.uid===u?{...p,[k]:v}:p)});
  const rmPM = (u)=>updPre(pre.id,{piezasManuales:(pre.piezasManuales||[]).filter(p=>p.uid!==u)});

  // Estante flotante
  const addEF = ()=>updPre(pre.id,{estFlotantes:[...(pre.estFlotantes||[]),{uid:uid(),ancho:600,prof:250}]});
  const updEF = (u,k,v)=>updPre(pre.id,{estFlotantes:(pre.estFlotantes||[]).map(e=>e.uid===u?{...e,[k]:v}:e)});
  const rmEF = (u)=>updPre(pre.id,{estFlotantes:(pre.estFlotantes||[]).filter(e=>e.uid!==u)});

  // Tapas de terminación
  const addTapa = ()=>updPre(pre.id,{tapasTerminacion:[...(pre.tapasTerminacion||[]),{uid:uid(),tipo:"bm",material:f.puerta||"agloBlanco",canto:f.cantoPuerta||"blanco04",cantidad:1}]});
  const updTapa = (u,k,v)=>updPre(pre.id,{tapasTerminacion:(pre.tapasTerminacion||[]).map(t=>t.uid===u?{...t,[k]:v}:t)});
  const rmTapa = (u)=>updPre(pre.id,{tapasTerminacion:(pre.tapasTerminacion||[]).filter(t=>t.uid!==u)});

  // No auto-login — always require password for security
  const doLogin = (u, pinOverride)=>{
    const pin = pinOverride || loginPin;
    if(pin !== u.pin) { setLoginErr("Contraseña incorrecta"); setLoginPin(""); setTimeout(()=>setLoginErr(""),2000); return; }
    const sess = {id:u.id, nombre:u.nombre, rol:u.rol};
    setUser(sess); setLoginPin(""); setLoginUser(null); setLoginErr("");
  };
  const doLogout = ()=>{ setUser(null); setView("clientes"); };
  const isAdmin = user?.rol === "admin";

  if (!ready) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:"#8a7d6b"}}>Cargando...</div>;

  // ── LOGIN SCREEN ──
  if (!user) return (
    <div style={{minHeight:"100vh",background:"#111",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{width:360,textAlign:"center"}}>
        <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:36,fontWeight:300,color:"#fff",letterSpacing:8,textTransform:"uppercase",marginBottom:6}}>Amoblex</div>
        <div style={{width:50,height:1,background:"#c9a96e",margin:"0 auto 8px"}}/>
        <div style={{fontSize:10,color:"#666",marginBottom:32,letterSpacing:2,textTransform:"uppercase"}}>Sistema de Presupuestos</div>
        
        {!loginUser ? (
          <div>
            <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:14}}>Seleccioná tu usuario</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {USERS.map(u=>(
                <div key={u.id} onClick={()=>{setLoginUser(u);setLoginPin("");setLoginErr("");}} style={{background:"#1a1a1a",borderRadius:12,padding:16,cursor:"pointer",textAlign:"center",transition:".2s",border:"2px solid #222"}} 
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a96e"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#222"}>
                  <div style={{width:44,height:44,borderRadius:22,background:u.rol==="admin"?"#c9a96e":"#444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:u.rol==="admin"?"#111":"#fff",margin:"0 auto 8px"}}>{u.nombre[0]}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{u.nombre}</div>
                  <div style={{fontSize:9,color:"#666",marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{u.rol==="admin"?"Admin":"Vendedora"}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={()=>setLoginUser(null)} style={{background:"transparent",border:"none",color:"#666",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>← Cambiar usuario</button>
            <div style={{background:"#1a1a1a",borderRadius:14,padding:24,border:"1px solid #222"}}>
              <div style={{width:50,height:50,borderRadius:25,background:loginUser.rol==="admin"?"#c9a96e":"#444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:loginUser.rol==="admin"?"#111":"#fff",margin:"0 auto 10px"}}>{loginUser.nombre[0]}</div>
              <div style={{fontSize:16,fontWeight:600,color:"#fff",marginBottom:2}}>{loginUser.nombre}</div>
              <div style={{fontSize:10,color:"#666",marginBottom:18,textTransform:"uppercase",letterSpacing:1}}>{loginUser.rol==="admin"?"Administrador":"Vendedora"}</div>
              <div style={{fontSize:11,color:"#888",marginBottom:8}}>Ingresá tu contraseña</div>
              <input 
                type="password" autoFocus autoComplete="current-password"
                value={loginPin} 
                onChange={e=>{setLoginPin(e.target.value);setLoginErr("");}}
                onKeyDown={e=>{if(e.key==="Enter"&&loginPin.length>=4){const usr=USERS.find(x=>x.id===loginUser.id);doLogin(usr,loginPin);}}}
                placeholder="Contraseña"
                style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #333",background:"#181818",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:12,textAlign:"center",letterSpacing:1}}
              />
              {loginErr && <div style={{marginTop:0,marginBottom:10,padding:"6px 12px",borderRadius:6,background:"#3b1111",color:"#f87171",fontSize:12,fontWeight:600}}>{loginErr}</div>}
              <button onClick={()=>{const usr=USERS.find(x=>x.id===loginUser.id);doLogin(usr,loginPin);}} style={{width:"100%",padding:"11px",borderRadius:8,border:"none",background:loginPin.length>=4?"#fff":"#333",color:loginPin.length>=4?"#111":"#666",fontSize:13,fontWeight:600,cursor:loginPin.length>=4?"pointer":"default",fontFamily:"'DM Sans',sans-serif",transition:".2s"}}>Ingresar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#f7f4ef,#ede8df,#e8e0d4)",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{background:"#111111",padding:"0",position:"sticky",top:0,zIndex:100}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",borderBottom:"1px solid #2a2a2a"}}>
          <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:20,fontWeight:300,color:"#fff",letterSpacing:5,textTransform:"uppercase"}}>Amoblex</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:16,background:isAdmin?"linear-gradient(135deg,#c9a96e,#e8c47c)":"linear-gradient(135deg,#666,#999)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:isAdmin?"#111":"#fff",fontWeight:700}}>{(user?.nombre||"?")[0]}</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{user?.nombre}</div>
              <div style={{fontSize:9,color:"#666",textTransform:"uppercase",letterSpacing:1}}>{user?.rol}</div>
            </div>
            <button onClick={doLogout} style={{background:"none",border:"1px solid #333",borderRadius:6,color:"#666",fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Salir</button>
          </div>
        </div>
        {/* Nav tabs */}
        <div style={{display:"flex",gap:1,padding:"0 12px",overflowX:"auto"}}>
          {[["clientes","Clientes"],["modular","Modular"],["personal","Personalizable"],["promob","Promob"],["resumen","Resumen"],["cuentas","Cuentas"],["precios","Precios"],["accesorios","Accesorios"],["compras","Compras"],["reportes","Reportes"],["audit","Auditoría"]]
            .filter(([k])=> {
              const adminOnly = ["precios","reportes","compras","resumen","audit","cuentas"];
              if(adminOnly.includes(k) && !isAdmin) return false;
              return true;
            })
            .map(([k,l])=>{
            const isActive = view===k || (k==="modular"&&["editPre","printPre","planilla"].includes(view)&&!(presupuestos.find(p=>p.id===preId)?.tipo==="personalizable")) || (k==="personal"&&["editPre","printPre","planilla"].includes(view)&&presupuestos.find(p=>p.id===preId)?.tipo==="personalizable") || (k==="promob"&&["manEdit","manPrint"].includes(view));
            return <button key={k} onClick={()=>{setView(k);if(k==="clientes")goList();}} style={{padding:"8px 14px",border:"none",fontSize:11,fontWeight:isActive?700:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:isActive?"#fff":"transparent",color:isActive?"#111":"#777",borderRadius:"6px 6px 0 0",transition:".2s",letterSpacing:isActive?.3:0}}>{l}{k==="precios"&&preciosUpd?" ✓":""}</button>;
          })}
        </div>
      </div>

      <div style={{maxWidth:1300,margin:"0 auto",padding:"16px 14px 50px"}}>

        {/* ═══ TOAST NOTIFICATIONS ═══ */}
        {toast && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:300,padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 8px 30px rgba(0,0,0,.3)",background:toast.type==="error"?"#dc2626":toast.type==="ok"?"#16a34a":"#d97706",color:"#fff",maxWidth:400,textAlign:"center",animation:"fadeIn .3s"}} onClick={()=>setToast(null)}>
          {toast.type==="error"?"⚠️ ":toast.type==="ok"?"✅ ":"⚡ "}{toast.msg}
        </div>}

        {/* ═══ SALUDO DIARIO ═══ */}
        {dailyMsg && <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.7)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setDailyMsg(null)}>
          <div style={{background:"#111",borderRadius:20,padding:"40px 36px",maxWidth:420,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.5)",border:"1px solid #222"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:40,marginBottom:12}}>👋</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:14,color:"#888",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{dailyMsg.saludo}</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:28,fontWeight:300,color:"#fff",letterSpacing:1,marginBottom:20}}>{dailyMsg.nombre}</div>
            <div style={{width:40,height:1,background:"#c9a96e",margin:"0 auto 20px"}}/>
            <div style={{fontSize:14,color:"#ccc",lineHeight:1.6,fontStyle:"italic",marginBottom:24}}>"{dailyMsg.frase}"</div>
            <button onClick={()=>setDailyMsg(null)} style={{padding:"10px 32px",borderRadius:8,border:"none",background:"#fff",color:"#111",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:.5}}>¡Arranquemos! 🚀</button>
          </div>
        </div>}

        {/* ═══ MODAL APROBACIÓN ═══ */}
        {approveModal && <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
            <div style={{fontSize:16,fontWeight:900,color:D,fontFamily:"'Playfair Display',serif",marginBottom:4}}>✅ Aprobar Presupuesto</div>
            <div style={{fontSize:11,color:"#8a7d6b",marginBottom:16}}>Ingresá la fecha probable de instalación:</div>
            <div style={{display:"grid",gap:10}}>
              <div><label style={lbl}>Fecha de instalación</label><input type="date" style={inp} value={approveModal.fechaInstalacion} onChange={e=>setApproveModal(p=>({...p,fechaInstalacion:e.target.value}))}/></div>
              {approveModal.fechaInstalacion && <div style={{fontSize:10,color:"#b45309",background:"#fef9c3",padding:"6px 10px",borderRadius:6,marginTop:2}}>
                💰 Fecha límite de pago: <b>{(()=>{const d=new Date(approveModal.fechaInstalacion+"T12:00:00");d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);})()}</b> <span style={{color:"#8a7d6b"}}>(día anterior a instalación)</span>
              </div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={confirmApprove} style={{...btnG,flex:1}}>✅ Confirmar Aprobación</button>
              <button onClick={()=>setApproveModal(null)} style={{...btnO,flex:1}}>Cancelar</button>
            </div>
          </div>
        </div>}

        {/* ════ WIZARD COCINA ════ */}
        {wizard && (()=>{
          const w = wizard;
          const d = w.data || {};
          const setD = (k,v) => setWizard({...w, data:{...d,[k]:v}});
          const step = w.step || 1;
          const setStep = (s) => setWizard({...w, step:s});
          const stpS = {fontSize:11,fontWeight:700,color:"#fff",background:D,padding:"4px 12px",borderRadius:20,display:"inline-block",marginBottom:8};
          const optBtn = (key, val, label, icon) => {
            const active = d[key]===val;
            return <button key={val} onClick={()=>setD(key,val)} style={{padding:"10px 16px",borderRadius:10,border:`2px solid ${active?G:"#e0d8cc"}`,background:active?"#fef9c3":"#fff",color:active?D:"#8a7d6b",fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center",minWidth:100,transition:".2s"}}>{icon?icon+" ":""}{label}</button>;
          };
          const chk = (key, label) => {
            const active = !!d[key];
            return <label key={key} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,border:`1.5px solid ${active?G:"#e0d8cc"}`,background:active?"#fef9c3":"#fff",cursor:"pointer",fontSize:12,fontWeight:active?700:400,color:active?D:"#8a7d6b",transition:".2s"}} onClick={()=>setD(key,!active)}>
              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${active?G:"#ccc"}`,background:active?G:"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:900}}>{active?"✓":""}</div>
              {label}
            </label>;
          };
          const numInp = (key, label, unit, placeholder) => <div>
            <label style={lbl}>{label}</label>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <input type="number" step="0.1" min="0" value={d[key]||""} onChange={e=>setD(key,parseFloat(e.target.value)||0)} style={{...inp,width:80,textAlign:"center",fontSize:14,fontWeight:700}} placeholder={placeholder||"0"}/>
              <span style={{fontSize:11,color:"#8a7d6b"}}>{unit}</span>
            </div>
          </div>;

          return <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto"}}>
            <div style={{background:"#fff",borderRadius:20,padding:28,maxWidth:600,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:D}}>🍳 Asistente de Cocina</div>
                <button onClick={()=>setWizard(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#999"}}>✕</button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {[1,2,3,4].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?G:"#e0d8cc"}}/>)}
              </div>

              {/* STEP 1: Layout y medidas */}
              {step===1 && <div>
                <div style={stpS}>Paso 1 — Ambiente, Forma y Medidas</div>
                <div style={{fontSize:12,color:"#8a7d6b",marginBottom:8}}>¿Qué tipo de ambiente es?</div>
                <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                  {optBtn("ambiente","cocina","🍳 Cocina")}
                  {optBtn("ambiente","placard","👔 Placard")}
                  {optBtn("ambiente","vanitory","🚿 Vanitory")}
                  {optBtn("ambiente","lavadero","🧺 Lavadero")}
                  {optBtn("ambiente","living","🛋️ Living/Estar")}
                  {optBtn("ambiente","dormitorio","🛏️ Dormitorio")}
                  {optBtn("ambiente","escritorio","💻 Escritorio")}
                  {optBtn("ambiente","otro","📦 Otro")}
                </div>
                <div style={{fontSize:12,color:"#8a7d6b",marginBottom:12}}>¿Qué forma tiene?</div>
                <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                  {optBtn("layout","lineal","Lineal","▬")}
                  {optBtn("layout","L","En L","⌐")}
                  {optBtn("layout","U","En U / C","⊔")}
                </div>
                {d.layout && <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
                  {numInp("tramo1", d.layout==="lineal"?"Largo total":"Tramo 1 (largo)", "metros", "3.5")}
                  {d.layout!=="lineal" && numInp("tramo2","Tramo 2 (largo)","metros","2.5")}
                  {d.layout==="U" && numInp("tramo3","Tramo 3 (largo)","metros","2.0")}
                </div>}
                {d.layout && (d.tramo1>0) && <div style={{padding:10,background:"#f0fdf4",borderRadius:8,fontSize:11,color:"#166534"}}>
                  Total: <b>{((d.tramo1||0)+(d.tramo2||0)+(d.tramo3||0)).toFixed(1)} metros</b> lineales
                </div>}
              </div>}

              {/* STEP 2: Qué incluye */}
              {step===2 && <div>
                <div style={stpS}>Paso 2 — ¿Qué incluye?</div>
                {/* COCINA */}
                {(!d.ambiente||d.ambiente==="cocina"||d.ambiente==="lavadero"||d.ambiente==="vanitory") && <>
                <div style={{fontSize:12,color:"#8a7d6b",marginBottom:12}}>Seleccioná todo lo que lleva:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                  {chk("bajomesada","🗄️ Bajo mesada")}
                  {chk("alacenas","🔲 Alacenas")}
                  {chk("torre","🏗️ Torre horno (piso a techo)")}
                  {chk("fregadero","🚰 Espacio fregadero")}
                  {chk("anafe","🔥 Anafe empotrable")}
                  {chk("cajonera","🗃️ Cajonera (al menos 1)")}
                  {chk("microondas","📦 Microondas empotrado")}
                  {chk("despensero","🚪 Despensero (piso a techo)")}
                  {chk("arribaHeladera","❄️ Heladera (piso a alacena, sin BM ni AL)")}
                  {chk("campana","💨 Campana extractora")}
                </div>
                {d.anafe && <div style={{marginBottom:10}}>
                  <label style={lbl}>Ancho anafe (mm)</label>
                  <select style={{...sel,width:120}} value={d.anchoAnafe||600} onChange={e=>setD("anchoAnafe",parseInt(e.target.value))}><option value={600}>600mm</option><option value={700}>700mm</option><option value={800}>800mm</option><option value={900}>900mm</option></select>
                </div>}
                {d.campana && <div style={{marginBottom:10}}>
                  <label style={lbl}>Ancho campana (mm)</label>
                  <select style={{...sel,width:120}} value={d.anchoCampana||600} onChange={e=>setD("anchoCampana",parseInt(e.target.value))}><option value={600}>600mm</option><option value={700}>700mm</option><option value={800}>800mm</option><option value={900}>900mm</option></select>
                </div>}
                {d.despensero && <div style={{marginBottom:10}}>
                  <label style={lbl}>Ancho despensero (mm)</label>
                  <select style={{...sel,width:120}} value={d.anchoDespensero||400} onChange={e=>setD("anchoDespensero",parseInt(e.target.value))}><option value={300}>300mm</option><option value={400}>400mm</option><option value={500}>500mm</option><option value={600}>600mm</option></select>
                </div>}
                {(d.torre || d.despensero || d.arribaHeladera) && <div style={{padding:8,background:"#fef2f2",borderRadius:6,fontSize:10,color:"#dc2626",marginBottom:8}}>
                  ⚠️ Torre, despensero y heladera van de <b>piso a altura de alacenas</b> — no llevan bajo mesada ni alacena en su espacio. Se restan del largo disponible.
                </div>}
                <div style={{fontSize:12,color:"#8a7d6b",marginTop:12,marginBottom:8}}>Tapas de terminación:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {chk("tapaBMIzq","◀ Tapa BM izquierda")}
                  {chk("tapaBMDer","Tapa BM derecha ▶")}
                  {d.alacenas && chk("tapaALIzq","◀ Tapa alacena izq")}
                  {d.alacenas && chk("tapaALDer","Tapa alacena der ▶")}
                </div>
                <div style={{marginTop:12}}>
                  {chk("led","💡 LED bajo alacenas")}
                </div>
                </>}
                {/* PLACARD / VESTIDOR */}
                {(d.ambiente==="placard"||d.ambiente==="vestidor") && <>
                <div style={{fontSize:12,color:"#8a7d6b",marginBottom:12}}>Configurá el placard:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                  <div><label style={lbl}>Alto (mm)</label><input type="number" style={{...inp,fontSize:13,fontWeight:700}} value={d.altoPlacard||2600} onChange={e=>setD("altoPlacard",parseInt(e.target.value)||2600)}/></div>
                  <div><label style={lbl}>Prof. exterior (mm)</label><input type="number" style={{...inp,fontSize:13,fontWeight:700}} value={d.profExt||600} onChange={e=>setD("profExt",parseInt(e.target.value)||600)}/></div>
                  <div><label style={lbl}>Prof. interior (mm)</label><input type="number" style={{...inp,fontSize:13,fontWeight:700}} value={d.profInt||500} onChange={e=>setD("profInt",parseInt(e.target.value)||500)}/></div>
                </div>
                <div style={{fontSize:11,color:"#8a7d6b",marginBottom:8}}>¿Qué zonas tiene?</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {chk("plEstantes","📚 Zona estantes")}
                  {chk("plBarraColgar","👔 Barra de colgar")}
                  {chk("plBarraDoble","👕 Barra doble (arriba/abajo)")}
                  {chk("plCajonera","🗃️ Cajonera")}
                  {chk("plZapatero","👟 Zapatero")}
                  {chk("plPantalonero","👖 Pantalonero")}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div><label style={lbl}>Banquina</label><select style={sel} value={d.banquinaPlacard||"material"} onChange={e=>setD("banquinaPlacard",e.target.value)}><option value="material">De material (obra)</option><option value="melamina">Zócalo melamina</option></select></div>
                  <div><label style={lbl}>Kit Puertas Corredizas</label><select style={sel} value={d.kitPlacard||"cl200"} onChange={e=>setD("kitPlacard",e.target.value)}>
                    <option value="cl150">Classic 1.50×2.60</option><option value="cl200">Classic 2.00×2.60</option><option value="cl300">Classic 3.00×2.60</option><option value="cl400">Classic 4.00×2.60</option><option value="hojaAdic">+ Hoja adicional 2.60</option><option value="sinPuertas">Sin puertas</option>
                  </select></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {chk("ledPlacardLat","💡 LED en laterales y divisores")}
                  {chk("plTapaIzq","◀ Tapa lateral izquierda")}
                  {chk("plTapaDer","Tapa lateral derecha ▶")}
                </div>
                <div style={{marginTop:8,padding:8,background:"#e0e7ff",borderRadius:6,fontSize:10,color:"#3730a3"}}>
                  ℹ️ Prof. exterior {d.profExt||600}mm (laterales, base, techo) — Prof. interior {d.profInt||500}mm (estantes, divisores) — diferencia de {(d.profExt||600)-(d.profInt||500)}mm para rieles puertas corredizas
                </div>
                </>}
                {/* OTROS AMBIENTES (dormitorio, living, escritorio, otro) */}
                {(d.ambiente==="dormitorio"||d.ambiente==="living"||d.ambiente==="escritorio"||d.ambiente==="otro") && <>
                <div style={{fontSize:12,color:"#8a7d6b",marginBottom:12}}>Seleccioná los elementos:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {chk("bajomesada","🗄️ Muebles bajos")}
                  {chk("alacenas","🔲 Estantes/Alacenas")}
                  {chk("cajonera","🗃️ Cajonera")}
                  {chk("despensero","🚪 Módulo alto")}
                  {chk("led","💡 LED")}
                </div>
                </>}
              </div>}

              {/* STEP 3: Materiales y apertura */}
              {step===3 && <div>
                <div style={stpS}>Paso 3 — Materiales y Apertura</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <label style={lbl}>Placa Interior</label>
                    <select style={sel} value={d.placaInterior||"agloBlanco"} onChange={e=>setD("placaInterior",e.target.value)}>
                      <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                      <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Detalle/Color interior</label><input style={inp} value={d.descInterior||""} onChange={e=>setD("descInterior",e.target.value)} placeholder="Ej: Roble Santana 18mm"/></div>
                  <div>
                    <label style={lbl}>Placa Puerta/Frente</label>
                    <select style={sel} value={d.placaPuerta||"agloBlanco"} onChange={e=>setD("placaPuerta",e.target.value)}>
                      <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                      <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option><option value="gloss">Gloss</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Detalle/Color puerta</label><input style={inp} value={d.descPuerta||""} onChange={e=>setD("descPuerta",e.target.value)} placeholder="Ej: Gris Grafito 18mm"/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <label style={lbl}>Apertura puertas</label>
                    <select style={sel} value={d.apertura||"melamina"} onChange={e=>setD("apertura",e.target.value)}>
                      <option value="melamina">Melamina (sin tirador)</option><option value="push">Push</option>
                      <option value="golaMadera">Gola Madera</option>
                      <option value="alumBlanco">Gola Alum. Blanco</option><option value="alumNegro">Gola Alum. Negro</option>
                      <option value="class70">Tirador Class 70</option><option value="barral128L">Barral 128mm</option>
                      <option value="manijaBarralInox128">Manija Barral Inox 128</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Bisagra</label>
                    <select style={sel} value={d.bisagra||"comun"} onChange={e=>setD("bisagra",e.target.value)}>
                      <option value="comun">Común</option><option value="cierreSuave">Cierre Suave</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Corredera</label>
                    <select style={sel} value={d.corredera||"comun"} onChange={e=>setD("corredera",e.target.value)}>
                      <option value="comun">Telescópica Común</option><option value="cierreSuave">Telescópica CS</option><option value="push">Push</option><option value="matrix">Matrix Box</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Medida corredera</label>
                    <select style={sel} value={d.correderaMedida||"50"} onChange={e=>setD("correderaMedida",e.target.value)}>
                      <option value="30">30cm</option><option value="35">35cm</option><option value="40">40cm</option><option value="45">45cm</option><option value="50">50cm</option><option value="55">55cm</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Color herrajes</label>
                    <select style={sel} value={d.colorHerraje||"aluminio"} onChange={e=>setD("colorHerraje",e.target.value)}>
                      <option value="aluminio">Aluminio / Anodizado</option><option value="negro">Negro</option>
                    </select>
                  </div>
                </div>
              </div>}

              {/* STEP 4: Resumen */}
              {step===4 && <div>
                <div style={stpS}>Paso 4 — Resumen</div>
                <div style={{...card,border:`2px solid ${G}`,background:"#fef9c3"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
                    <div><b>Ambiente:</b> {AMB_ICONS[d.ambiente||"cocina"]} {AMB_LABELS[d.ambiente||"cocina"]}</div>
                    <div><b>Layout:</b> {d.layout==="lineal"?"Lineal":d.layout==="L"?"En L":"En U/C"}</div>
                    <div><b>Total:</b> {((d.tramo1||0)+(d.tramo2||0)+(d.tramo3||0)).toFixed(1)}m</div>
                    {d.bajomesada && <div>✅ Bajo mesada</div>}
                    {d.alacenas && <div>✅ Alacenas</div>}
                    {d.torre && <div>✅ Torre horno 600mm (piso a techo)</div>}
                    {d.fregadero && <div>✅ Fregadero</div>}
                    {d.anafe && <div>✅ Anafe {d.anchoAnafe||600}mm</div>}
                    {d.cajonera && <div>✅ Cajonera</div>}
                    {d.microondas && <div>✅ Microondas</div>}
                    {d.despensero && <div>✅ Despensero {d.anchoDespensero||400}mm (piso a techo)</div>}
                    {d.arribaHeladera && <div>✅ Heladera 950mm (piso a alacena, sin BM ni AL)</div>}
                    {d.led && <div>✅ LED</div>}
                    <div><b>Interior:</b> {d.placaInterior||"agloBlanco"} {d.descInterior||""}</div>
                    <div><b>Puerta:</b> {d.placaPuerta||"agloBlanco"} {d.descPuerta||""}</div>
                    <div><b>Apertura:</b> {d.apertura||"melamina"}</div>
                    <div><b>Bisagra:</b> {d.bisagra||"comun"} · <b>Corredera:</b> {d.corredera||"comun"} {d.correderaMedida||50}cm</div>
                    <div><b>Color:</b> {d.colorHerraje||"aluminio"}</div>
                  </div>
                </div>
                <div style={{marginTop:8,padding:10,background:"#f0fdf4",borderRadius:8,fontSize:11,color:"#166534"}}>
                  Los módulos se generarán automáticamente. Después podés ajustar cada uno, agregar o quitar módulos manualmente.
                </div>
              </div>}

              {/* Navigation */}
              <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"space-between"}}>
                <div>
                  {step>1 && <button onClick={()=>setStep(step-1)} style={btnO}>← Anterior</button>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setWizard(null)} style={{...btnO,color:"#999",borderColor:"#ccc"}}>Cancelar</button>
                  {step<4 && <button onClick={()=>{
                    if(step===1 && (!d.layout||!d.tramo1)) { showToast("Elegí la forma y cargá al menos el primer tramo","error"); return; }
                    if(step===1 && !d.ambiente) { setD("ambiente","cocina"); }
                    if(step===2 && (d.ambiente==="placard"||d.ambiente==="vestidor") && !d.plEstantes && !d.plBarraColgar && !d.plBarraDoble && !d.plCajonera) { showToast("Seleccioná al menos una zona del placard","error"); return; }
                    if(step===2 && d.ambiente!=="placard" && d.ambiente!=="vestidor" && !d.bajomesada && !d.alacenas) { showToast("Seleccioná al menos bajo mesada o alacenas","error"); return; }
                    setStep(step+1);
                  }} style={btnG}>Siguiente →</button>}
                  {step===4 && <button onClick={()=>wizardGenerate(w)} style={{...btnG,fontSize:14,padding:"10px 24px"}}>{AMB_ICONS[d.ambiente||"cocina"]||"🍳"} Generar {AMB_LABELS[d.ambiente||"cocina"]||"Ambiente"}</button>}
                </div>
              </div>
            </div>
          </div>;
        })()}

        {/* ════ CLIENTES ════ */}
        {view==="clientes" && <>
          <Sec icon="👥" title="Clientes" right={<button onClick={newCli} style={btnG}>+ Nuevo Cliente</button>}/>
          <input placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:260,marginBottom:12}}/>
          {filtClis.length===0 && <p style={{color:"#8a7d6b",fontSize:13}}>{search?"Sin resultados.":"Creá un cliente para empezar."}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260,1fr))",gap:10}}>
            {filtClis.map(c=>{
              const cp=presupuestos.filter(p=>p.clienteId===c.id);
              return(
                <div key={c.id} style={{...card,cursor:"pointer"}} onClick={()=>goCli(c.id)}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:D}}>{c.nombre||"Sin nombre"}</div>
                      {c.telefono && <div style={{fontSize:11,color:"#8a7d6b"}}>📱 {c.telefono}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:20,fontWeight:900,color:G}}>{cp.length}</div>
                      <div style={{fontSize:9,color:"#8a7d6b"}}>presup.</div>
                    </div>
                  </div>
                  {cp.length>0 && <div style={{display:"flex",gap:4,marginTop:6}}>
                    <span style={badge("Aprobado")}>{cp.filter(p=>p.estado==="Aprobado").length} aprob.</span>
                    <span style={badge("Pendiente")}>{cp.filter(p=>p.estado==="Pendiente").length} pend.</span>
                  </div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ════ EDIT CLIENTE ════ */}
        {view==="editCli" && cli && <>
          <button onClick={goList} style={{...btnO,marginBottom:10}}>← Clientes</button>
          <Sec icon="👤" title={cli.nombre||"Nuevo Cliente"}/>
          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <FRow label="Nombre"><input style={inp} value={cli.nombre} onChange={e=>updCli(cli.id,"nombre",e.target.value)}/></FRow>
              <FRow label="Teléfono"><input style={inp} value={cli.telefono||""} onChange={e=>updCli(cli.id,"telefono",e.target.value)}/></FRow>
              <FRow label="Email"><input style={inp} value={cli.email||""} onChange={e=>updCli(cli.id,"email",e.target.value)}/></FRow>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginTop:8}}>
              <FRow label="Dirección"><input style={inp} value={cli.direccion||""} onChange={e=>updCli(cli.id,"direccion",e.target.value)}/></FRow>
              <FRow label="Notas"><input style={inp} value={cli.notas||""} onChange={e=>updCli(cli.id,"notas",e.target.value)}/></FRow>
            </div>
            {confirmDel?.type==="cli"&&confirmDel?.id===cli.id ? (
              <div style={{marginTop:10,padding:10,background:"#fee2e2",borderRadius:8,border:"1px solid #fca5a5"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#dc2626",marginBottom:6}}>⚠️ ¿Eliminar a {cli.nombre||"este cliente"} y todos sus presupuestos?</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{delCli(cli.id);setConfirmDel(null);}} style={{...btnD,fontSize:11,padding:"6px 16px"}}>Sí, eliminar</button>
                  <button onClick={()=>setConfirmDel(null)} style={{...btnO,fontSize:11,padding:"6px 16px"}}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setConfirmDel({type:"cli",id:cli.id})} style={{...btnD,fontSize:11,marginTop:10}}>🗑️ Eliminar cliente</button>
            )}
          </div>

          <Sec icon="📋" title="Presupuestos" right={<button onClick={()=>newPre(cli.id)} style={btnG}>+ Nuevo</button>}/>
          {cliPres.length===0 && <p style={{color:"#8a7d6b",fontSize:12}}>Sin presupuestos.</p>}
          {cliPres.map(pr=>{
            const t=calcPresupTotal(pr,precios,accesorios);
            return(
              <div key={pr.id} style={{...card,display:"flex",alignItems:"center",gap:10,padding:12,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:G,fontSize:14}}>#{pr.numero}</span>
                <span style={{flex:1,fontSize:12,color:"#8a7d6b"}}>{pr.fecha} — {(pr.modulos||[]).length} módulos {pr.creadoPor && <span style={{fontSize:9,background:"#e8e0d4",padding:"1px 5px",borderRadius:4}}>por {pr.creadoPor}</span>}</span>
                <span style={badge(pr.estado)}>{pr.estado}</span>
                {pr.fechaInstalacion && <span style={{fontSize:9,color:"#16a34a"}} title={`Instalación: ${pr.fechaInstalacion}`}>📅 {pr.fechaInstalacion}</span>}
                <span style={{fontWeight:700,fontSize:14,minWidth:100,textAlign:"right"}}>{$(t.total)}</span>
                <button onClick={()=>goPre(pr.id)} style={btnO}>Editar</button>
                <select value={pr.estado} onChange={e=>handleEstado(pr.id,e.target.value)} style={{padding:"3px 5px",borderRadius:5,border:"1px solid #e0d8cc",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  <option>Pendiente</option><option>Aprobado</option><option>Rechazado</option>
                </select>
                <button onClick={()=>{
                  if(confirmDel?.type==="pre"&&confirmDel?.id===pr.id) { delPre(pr.id); setConfirmDel(null); }
                  else setConfirmDel({type:"pre",id:pr.id});
                }} style={{...btnD,background:confirmDel?.type==="pre"&&confirmDel?.id===pr.id?"#dc2626":"transparent",color:confirmDel?.type==="pre"&&confirmDel?.id===pr.id?"#fff":"#dc2626"}}>{confirmDel?.type==="pre"&&confirmDel?.id===pr.id?"¿Seguro?":"×"}</button>
              </div>
            );
          })}

          {/* ═══ CUENTA CORRIENTE ═══ */}
          {isAdmin && (()=>{
            const cliAprobados = cliPres.filter(p=>p.estado==="Aprobado");
            const totalDeuda = cliAprobados.reduce((s,p)=>s+calcPresupTotal(p,precios,accesorios).total,0);
            const cliPagos = pagos.filter(p=>p.clienteId===cli.id);
            const pagosPositivos = cliPagos.filter(p=>p.monto>0);
            const ajustesIPC = cliPagos.filter(p=>p.monto<0);
            const totalPagado = pagosPositivos.reduce((s,p)=>s+p.monto,0);
            const totalAjustes = ajustesIPC.reduce((s,p)=>s+Math.abs(p.monto),0);
            const saldo = totalDeuda + totalAjustes - totalPagado;
            return <>
              <Sec icon="💳" title="Cuenta Corriente"/>
              <div style={{background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{display:"grid",gridTemplateColumns:totalAjustes>0?"1fr 1fr 1fr 1fr":"1fr 1fr 1fr",gap:14,textAlign:"center"}}>
                  <div><div style={{fontSize:10,color:"#a09880"}}>Total Aprobado</div><div style={{fontSize:18,fontWeight:900,color:"#e8c47c"}}>{$(totalDeuda)}</div></div>
                  {totalAjustes>0 && <div><div style={{fontSize:10,color:"#a09880"}}>Ajuste IPC</div><div style={{fontSize:18,fontWeight:900,color:"#f87171"}}>+ {$(totalAjustes)}</div></div>}
                  <div><div style={{fontSize:10,color:"#a09880"}}>Total Pagado</div><div style={{fontSize:18,fontWeight:900,color:"#7dd3a0"}}>{$(totalPagado)}</div></div>
                  <div><div style={{fontSize:10,color:"#a09880"}}>Saldo</div><div style={{fontSize:18,fontWeight:900,color:saldo>0?"#f87171":"#7dd3a0"}}>{$(saldo)}</div></div>
                </div>
              </div>
              <div style={card}>
                <div style={{fontSize:11,fontWeight:700,color:D,marginBottom:8}}>Registrar Pago</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 110px 100px 1fr 50px",gap:6,alignItems:"end"}}>
                  <div><label style={lbl}>Presupuesto</label><select style={{...sel,fontSize:10,padding:"5px"}} value={pagoForm.preId} onChange={e=>setPagoForm(p=>({...p,preId:e.target.value}))}><option value="">General</option>{cliAprobados.map(p=><option key={p.id} value={p.id}>#{p.numero}</option>)}</select></div>
                  <div><label style={lbl}>Monto</label><MoneyInput value={pagoForm.monto} onChange={v=>setPagoForm(p=>({...p,monto:v}))} style={{...inp,fontSize:11,padding:"5px",textAlign:"right"}}/></div>
                  <div><label style={lbl}>Tipo</label><select style={{...sel,fontSize:10,padding:"5px"}} value={pagoForm.tipo} onChange={e=>setPagoForm(p=>({...p,tipo:e.target.value}))}><option>Efectivo</option><option>Transferencia</option><option>Cheque</option><option>Tarjeta</option><option>Otro</option></select></div>
                  <div><label style={lbl}>Nota</label><input style={{...inp,fontSize:11,padding:"5px"}} value={pagoForm.nota} onChange={e=>setPagoForm(p=>({...p,nota:e.target.value}))} placeholder="Opcional"/></div>
                  <button onClick={()=>{
                    if(!pagoForm.monto || pagoForm.monto<=0) return;
                    addPago(cli.id,pagoForm.preId,pagoForm.monto,pagoForm.tipo,pagoForm.nota);
                    setPagoForm({preId:"",monto:0,tipo:"Efectivo",nota:""});
                  }} style={btnG}>+</button>
                </div>

                {/* ── Ajuste IPC ── */}
                {(()=>{
                  const fechaInstalAuto = cliAprobados.map(p=>p.fechaInstalacion).filter(Boolean).sort().pop() || "";
                  const primerPago = cliPagos.filter(p=>p.monto>0).sort((a,b)=>a.fecha.localeCompare(b.fecha))[0]?.fecha || "";
                  return <div style={{marginTop:14,paddingTop:12,borderTop:`2px solid ${G}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:D,marginBottom:6}}>📈 Ajuste por IPC</div>
                  <div style={{fontSize:10,color:"#8a7d6b",marginBottom:8}}>Calculá el ajuste por inflación entre el primer pago y la fecha de instalación</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px",gap:8,alignItems:"end"}}>
                    <div><label style={lbl}>Fecha primer pago</label><input id="ipcDesde" type="date" style={{...inp,fontSize:11,padding:"5px"}} defaultValue={primerPago}/></div>
                    <div><label style={lbl}>Fecha instalación</label><input id="ipcHasta" type="date" style={{...inp,fontSize:11,padding:"5px"}} defaultValue={fechaInstalAuto}/></div>
                    <button onClick={()=>{
                      const desde=document.getElementById("ipcDesde").value;
                      const hasta=document.getElementById("ipcHasta").value;
                      calcIPC(desde, hasta, saldo>0?saldo:0);
                    }} disabled={ipcState.loading} style={{...btnO,fontSize:10,padding:"5px 8px",opacity:ipcState.loading?.6:1}}>
                      {ipcState.loading?"⏳ Buscando...":"🔍 Calcular IPC"}
                    </button>
                  </div>
                  {ipcState.error && <div style={{marginTop:6,padding:6,background:"#fee2e2",borderRadius:6,fontSize:10,color:"#dc2626"}}>{ipcState.error}</div>}
                  {ipcState.result && <div style={{marginTop:8,padding:10,background:"#fffbeb",borderRadius:8,border:"1px solid #fde68a"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center",marginBottom:8}}>
                      <div><div style={{fontSize:9,color:"#8a7d6b"}}>IPC Acumulado</div><div style={{fontSize:18,fontWeight:900,color:"#b45309"}}>{ipcState.result.porcentaje}%</div></div>
                      <div><div style={{fontSize:9,color:"#8a7d6b"}}>Saldo Base</div><div style={{fontSize:14,fontWeight:700,color:D}}>{$(ipcState.result.saldoBase)}</div></div>
                      <div><div style={{fontSize:9,color:"#8a7d6b"}}>Ajuste a Cobrar</div><div style={{fontSize:18,fontWeight:900,color:"#dc2626"}}>{$(ipcState.result.ajuste)}</div></div>
                    </div>
                    <div style={{fontSize:9,color:"#8a7d6b",marginBottom:8,fontStyle:"italic"}}>{ipcState.result.detalle}</div>
                    <div style={{fontSize:9,color:"#8a7d6b",marginBottom:6}}>Período: {ipcState.result.fechaDesde} → {ipcState.result.fechaHasta}</div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{
                        // Add as negative payment (charge) to account
                        const p={id:uid(),clienteId:cli.id,preId:"",fecha:new Date().toISOString().slice(0,10),
                          hora:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}),
                          monto: -ipcState.result.ajuste,
                          tipo:"Ajuste IPC",
                          nota:`IPC ${ipcState.result.porcentaje}% (${ipcState.result.fechaDesde} → ${ipcState.result.fechaHasta})`};
                        setPagos(prev=>[...prev,p]);
                        setIpcState({loading:false,result:null,error:null});
                      }} style={{...btnG,fontSize:10}}>➕ Agregar como cargo al saldo</button>
                      <button onClick={()=>setIpcState({loading:false,result:null,error:null})} style={{...btnO,fontSize:10}}>Descartar</button>
                    </div>
                  </div>}
                </div>;
                })()}
                {cliPagos.length>0 && <div style={{marginTop:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#8a7d6b",marginBottom:4}}>Historial de Pagos</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{background:"#f5f0e8"}}><th style={{padding:"5px 8px",textAlign:"left"}}>Fecha</th><th style={{padding:"5px",textAlign:"left"}}>Hora</th><th style={{padding:"5px",textAlign:"left"}}>Presup.</th><th style={{padding:"5px",textAlign:"right"}}>Monto</th><th style={{padding:"5px",textAlign:"center"}}>Tipo</th><th style={{padding:"5px",textAlign:"left"}}>Nota</th><th style={{width:30}}></th></tr></thead>
                    <tbody>{cliPagos.sort((a,b)=>(b.ultimaMod||b.fecha).localeCompare(a.ultimaMod||a.fecha)).map(p=>(
                      <tr key={p.id} style={{borderBottom:"1px solid #f0ebe3",background:p.monto<0?"#fef2f2":"transparent"}}>
                        <td style={{padding:"5px 8px"}}>{p.fecha}</td>
                        <td style={{padding:"5px",color:"#8a7d6b",fontSize:10}}>{p.hora||""}</td>
                        <td style={{padding:"5px"}}>{p.preId?`#${presupuestos.find(x=>x.id===p.preId)?.numero||"?"}`:"—"}</td>
                        <td style={{padding:"5px",textAlign:"right",fontWeight:700,color:p.monto<0?"#dc2626":"#16a34a"}}>{p.monto<0?`+ ${$(-p.monto)}`:$(p.monto)}</td>
                        <td style={{padding:"5px",textAlign:"center"}}><span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:p.tipo==="Efectivo"?"#dcfce7":p.tipo==="Transferencia"?"#dbeafe":p.tipo==="Cheque"?"#fef9c3":p.tipo==="Tarjeta"?"#f3e8ff":p.tipo==="Ajuste IPC"?"#fef2f2":"#f5f5f5",color:p.tipo==="Ajuste IPC"?"#dc2626":"inherit",fontWeight:600}}>{p.tipo}</span></td>
                        <td style={{padding:"5px",color:"#8a7d6b",fontSize:10}}>{p.nota||""}</td>
                        <td><button onClick={()=>delPago(p.id)} style={{...btnD,padding:"2px 6px",fontSize:10}}>×</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>}
              </div>
            </>;
          })()}
        </>}

        {/* ════ PRESUPUESTOS MODULARES (lista) ════ */}
        {view==="modular" && <>
          <Sec icon="📐" title="Presupuestos Modulares" right={
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <select id="modNewCli" style={{...sel,fontSize:11,padding:"5px 8px"}}><option value="">Elegir cliente...</option>{clientes.sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||"")).map(c=><option key={c.id} value={c.id}>{c.nombre||"Sin nombre"}{c.telefono?" · "+c.telefono:""}</option>)}</select>
              <button onClick={()=>{const cid=document.getElementById("modNewCli").value;if(!cid){showToast("Elegí un cliente primero","error");return;}newPre(cid,"modular");setView("editPre");}} style={btnG}>+ Vacío</button>
              <button onClick={()=>{const cid=document.getElementById("modNewCli").value;if(!cid){showToast("Elegí un cliente primero","error");return;}setWizard({step:1,tipo:"modular",cliId:cid,data:{ambiente:"cocina",bajomesada:true,alacenas:true,fregadero:true}});}} style={{...btnG,background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff"}}>🍳 Asistente</button>
            </div>
          }/>
          <input placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:260,marginBottom:12}}/>
          {(()=>{
            const allPres = presupuestos.filter(p=>p.tipo!=="personalizable").map(p=>{const cl=clientes.find(c=>c.id===p.clienteId);return {...p,cliNombre:cl?.nombre||"Sin cliente",cliTel:cl?.telefono||""};}).filter(p=>!search || p.cliNombre.toLowerCase().includes(search.toLowerCase()) || String(p.numero).includes(search)).sort((a,b)=>(b.ultimaMod||b.fecha).localeCompare(a.ultimaMod||a.fecha));
            if(allPres.length===0) return <div style={{...card,textAlign:"center",color:"#8a7d6b",fontSize:13,padding:30}}>No hay presupuestos modulares. Elegí un cliente y creá uno nuevo.</div>;
            return <div style={{display:"grid",gap:8}}>
              {allPres.map(p=>{
                const t=calcPresupTotal(p,precios,accesorios);
                return <div key={p.id} onClick={()=>{setPreId(p.id);setCliId(p.clienteId);setView("editPre");}} style={{...card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",gap:10}}>
                  <div style={{flex:1}}>
                    <span style={{fontWeight:700,color:D,fontSize:14}}>#{p.numero}</span>
                    <span style={ambBadge(p.ambiente)}>{AMB_ICONS[p.ambiente||"cocina"]||"📦"} {AMB_LABELS[p.ambiente||"cocina"]||""}</span> <span style={{marginLeft:4,fontSize:13,color:G,fontWeight:600}}>{p.cliNombre}</span>
                    {p.cliTel && <span style={{marginLeft:6,fontSize:10,color:"#8a7d6b"}}>📱 {p.cliTel}</span>}
                    <span style={{marginLeft:8,fontSize:11,color:"#8a7d6b"}}>{p.fecha}</span>
                    <span style={{marginLeft:6,fontSize:10,color:"#a09880"}}>{(p.modulos||[]).length} mód</span>
                    {p.fechaInstalacion && <span style={{marginLeft:6,fontSize:9,color:"#16a34a"}}>📅 {p.fechaInstalacion}</span>}
                  </div>
                  <span style={badge(p.estado)}>{p.estado}</span>
                  <span style={{fontWeight:900,fontSize:14,color:D,minWidth:100,textAlign:"right"}}>{$(t.total)}</span>
                  {p.estado==="Aprobado" && <button onClick={e=>{e.stopPropagation();duplicarConPreciosNuevos(p.id);}} style={{fontSize:9,padding:"4px 8px",borderRadius:5,border:`1px solid ${G}`,background:"transparent",color:G,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,whiteSpace:"nowrap"}} title="Duplicar con precios actuales">🔄 Actualizar</button>}
                </div>;
              })}
            </div>;
          })()}
        </>}

        {/* ════ PERSONALIZABLE (lista) ════ */}
        {view==="personal" && <>
          <Sec icon="🎨" title="Modular Personalizable" right={
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <select id="persNewCli" style={{...sel,fontSize:11,padding:"5px 8px"}}><option value="">Elegir cliente...</option>{clientes.sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||"")).map(c=><option key={c.id} value={c.id}>{c.nombre||"Sin nombre"}{c.telefono?" · "+c.telefono:""}</option>)}</select>
              <button onClick={()=>{const cid=document.getElementById("persNewCli").value;if(!cid){showToast("Elegí un cliente primero","error");return;}newPre(cid,"personalizable");setView("editPre");}} style={btnG}>+ Vacío</button>
              <button onClick={()=>{const cid=document.getElementById("persNewCli").value;if(!cid){showToast("Elegí un cliente primero","error");return;}setWizard({step:1,tipo:"personalizable",cliId:cid,data:{ambiente:"cocina",bajomesada:true,alacenas:true,fregadero:true}});}} style={{...btnG,background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff"}}>🍳 Asistente</button>
            </div>
          }/>
          <div style={{fontSize:10,color:"#8a7d6b",marginBottom:10,padding:"6px 10px",background:"#fef9c3",borderRadius:6}}>En este modo podés personalizar placa, cantos, bisagras y correderas de cada módulo individualmente.</div>
          <input placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:260,marginBottom:12}}/>
          {(()=>{
            const allPers = presupuestos.filter(p=>p.tipo==="personalizable").map(p=>{const cl=clientes.find(c=>c.id===p.clienteId);return {...p,cliNombre:cl?.nombre||"Sin cliente",cliTel:cl?.telefono||""};}).filter(p=>!search || p.cliNombre.toLowerCase().includes(search.toLowerCase()) || String(p.numero).includes(search)).sort((a,b)=>(b.ultimaMod||b.fecha).localeCompare(a.ultimaMod||a.fecha));
            if(allPers.length===0) return <div style={{...card,textAlign:"center",color:"#8a7d6b",fontSize:13,padding:30}}>No hay presupuestos personalizables.</div>;
            return <div style={{display:"grid",gap:8}}>
              {allPers.map(p=>{
                const t=calcPresupTotal(p,precios,accesorios);
                return <div key={p.id} onClick={()=>{setPreId(p.id);setCliId(p.clienteId);setView("editPre");}} style={{...card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",gap:10}}>
                  <div style={{flex:1}}>
                    <span style={{fontWeight:700,color:D,fontSize:14}}>#{p.numero}</span>
                    <span style={ambBadge(p.ambiente)}>{AMB_ICONS[p.ambiente||"cocina"]||"📦"} {AMB_LABELS[p.ambiente||"cocina"]||""}</span> <span style={{marginLeft:4,fontSize:13,color:G,fontWeight:600}}>{p.cliNombre}</span>
                    {p.cliTel && <span style={{marginLeft:6,fontSize:10,color:"#8a7d6b"}}>📱 {p.cliTel}</span>}
                    <span style={{marginLeft:8,fontSize:11,color:"#8a7d6b"}}>{p.fecha}</span>
                    <span style={{marginLeft:6,fontSize:10,color:"#a09880"}}>{(p.modulos||[]).length} mód</span>
                  </div>
                  <span style={badge(p.estado)}>{p.estado}</span>
                  <span style={{fontWeight:900,fontSize:14,color:D,minWidth:100,textAlign:"right"}}>{$(t.total)}</span>
                  {p.estado==="Aprobado" && <button onClick={e=>{e.stopPropagation();duplicarConPreciosNuevos(p.id);}} style={{fontSize:9,padding:"4px 8px",borderRadius:5,border:`1px solid ${G}`,background:"transparent",color:G,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>🔄 Actualizar</button>}
                </div>;
              })}
            </div>;
          })()}
        </>}

        {/* ════ EDIT PRESUPUESTO ════ */}
        {view==="editPre" && pre && (()=>{
          const isGuille = user?.id==="guille";
          const locked = pre.estado==="Aprobado" && !isGuille;
          const lockStyle = locked ? {opacity:.6, pointerEvents:"none"} : {};
          const isPersonal = pre.tipo==="personalizable";
          const backView = isPersonal ? "personal" : "modular";
          return <>
          <button onClick={()=>{setPreId(null);setView(backView);}} style={{...btnO,marginBottom:10}}>← {isPersonal?"Personalizable":"Modulares"}</button>
          <Sec icon={isPersonal?"🎨":(AMB_ICONS[pre.ambiente]||"📋")} title={`${isPersonal?"Personalizable":"Presupuesto"} #${pre.numero} — ${AMB_LABELS[pre.ambiente||"cocina"]||""} — ${clientes.find(c=>c.id===pre.clienteId)?.nombre||""}`} right={
            pre.estado==="Aprobado" ? <button onClick={()=>duplicarConPreciosNuevos(pre.id)} style={{...btnO,fontSize:11}}>🔄 Duplicar con precios actuales</button> : null
          }/>

          {/* Banner aprobado */}
          {pre.estado==="Aprobado" && <div style={{padding:"10px 16px",marginBottom:12,borderRadius:8,background:"#f0fdf4",border:"2px solid #16a34a",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🔒</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>Presupuesto Aprobado — {isGuille?"Podés editar como admin":"Solo lectura"}</div>
              <div style={{fontSize:10,color:"#8a7d6b"}}>Precios al {pre.fechaAprobado||"—"}{pre.duplicadoDe?` · Duplicado de #${pre.duplicadoDe}`:""}</div>
            </div>
          </div>}

          {/* Estado y fecha */}
          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:10}}>
              <FRow label="Ambiente"><select style={sel} value={pre.ambiente||"cocina"} onChange={e=>{updPre(pre.id,{ambiente:e.target.value}); const newAmb=e.target.value; setCatSel(newAmb==="placard"||newAmb==="vestidor"?"plInt":"bm");}} disabled={locked}>
                <option value="cocina">🍳 Cocina</option><option value="placard">👔 Placard</option><option value="vanitory">🚿 Vanitory</option>
                <option value="lavadero">🧺 Lavadero</option><option value="living">🛋️ Living</option><option value="dormitorio">🛏️ Dormitorio</option>
                <option value="escritorio">💻 Escritorio</option><option value="otro">📦 Otro</option>
              </select></FRow>
              <FRow label="Fecha"><input type="date" style={inp} value={pre.fecha} onChange={e=>updPre(pre.id,{fecha:e.target.value})} disabled={locked}/></FRow>
              <FRow label="Estado"><select style={sel} value={pre.estado} onChange={e=>handleEstado(pre.id,e.target.value)} disabled={locked && !isGuille}><option>Pendiente</option><option>Aprobado</option><option>Rechazado</option></select></FRow>
              <FRow label="Creado por"><div style={{...inp,background:"#f0ebe3",fontSize:12}}>{pre.creadoPor||"—"}</div></FRow>
              <div style={{display:"flex",alignItems:"flex-end"}}><span style={badge(pre.estado)}>{pre.estado}</span></div>
            </div>
            {pre.fechaInstalacion && <div style={{marginTop:8,padding:8,background:"#f0fdf4",borderRadius:6,border:"1px solid #bbf7d0",fontSize:10}}>
              <span style={{fontWeight:700,color:"#16a34a"}}>📅 Fecha de instalación:</span>{" "}
              <b>{pre.fechaInstalacion}</b>{" · "}
              <span>💰 Pago hasta: <b>{(()=>{const d=new Date(pre.fechaInstalacion+"T12:00:00");d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);})()}</b></span>
            </div>}
          </div>

          {/* ── CONFIGURACIÓN GENERAL ── */}
          <Sec icon="⚙️" title="Configuración General"/>
          <div style={lockStyle}>
          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              <FRow label="Placa Interior"><select style={sel} value={f.interior||"agloBlanco"} onChange={e=>setF("interior",e.target.value)}>
                <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option>
              </select></FRow>
              <FRow label="Detalle Interior"><input style={inp} value={f.descInterior||""} onChange={e=>setF("descInterior",e.target.value)} placeholder="Ej: Roble Santana 18mm"/></FRow>
              <FRow label="Placa Puerta/Frente"><select style={sel} value={f.puerta} onChange={e=>setF("puerta",e.target.value)}>
                <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option><option value="gloss">Gloss</option>
              </select></FRow>
              <FRow label="Detalle Puerta"><input style={inp} value={f.descPuerta||""} onChange={e=>setF("descPuerta",e.target.value)} placeholder="Ej: Gris Grafito 18mm"/></FRow>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:10}}>
              <FRow label="Color Fondo"><select style={sel} value={f.colorFondo} onChange={e=>setF("colorFondo",e.target.value)}><option value="blanco">Blanco</option><option value="color">Color</option></select></FRow>
              <FRow label="Detalle Fondo"><input style={inp} value={f.descFondo||""} onChange={e=>setF("descFondo",e.target.value)} placeholder="Ej: Blanco Liso"/></FRow>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:10}}>
              <FRow label="Canto Interior (trasero)"><select style={sel} value={f.cantoInt||"blanco04"} onChange={e=>setF("cantoInt",e.target.value)}>
                <option value="blanco04">Blanco 0,4mm</option><option value="color04">Color 0,4mm</option>
                <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
              </select></FRow>
              <FRow label="Canto Frontal (lat/base/trav)"><select style={sel} value={f.cantoFrontal||"blanco04"} onChange={e=>setF("cantoFrontal",e.target.value)}>
                <option value="blanco04">Blanco 0,4mm</option><option value="color04">Color 0,4mm</option>
                <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
              </select></FRow>
              <FRow label="Canto Puerta"><select style={sel} value={preGloss?"gloss1":(f.cantoPuerta||"blanco04")} onChange={e=>setF("cantoPuerta",e.target.value)} disabled={preGloss}>
                {preGloss?<option value="gloss1">Gloss 1mm</option>:<>
                <option value="blanco04">Blanco 0,4mm</option><option value="color04">Color 0,4mm</option>
                <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
                <option value="gloss1">Gloss 1mm</option></>}
              </select></FRow>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:10}}>
              <FRow label="Bisagra (general)"><select style={sel} value={f.bisagra||"comun"} onChange={e=>setF("bisagra",e.target.value)}><option value="comun">Común</option><option value="cierreSuave">Cierre Suave</option><option value="push">Push (+expulsores)</option></select></FRow>
              <FRow label="Corredera (tipo)"><select style={sel} value={f.corredera} onChange={e=>setF("corredera",e.target.value)}><option value="comun">Telescópica Común</option><option value="cierreSuave">Telescópica CS</option><option value="push">Push</option><option value="matrix">Matrix Box</option><option value="lateral">Lat. Metálicos</option></select></FRow>
              <FRow label="Medida corredera"><select style={sel} value={f.correderaMedida||"50"} onChange={e=>setF("correderaMedida",e.target.value)}>
                <option value="30">30 cm</option><option value="35">35 cm</option><option value="40">40 cm</option><option value="45">45 cm</option><option value="50">50 cm</option><option value="55">55 cm</option>
              </select></FRow>
              <FRow label="Color herrajes"><select style={sel} value={f.colorHerraje||"aluminio"} onChange={e=>setF("colorHerraje",e.target.value)}>
                <option value="aluminio">Aluminio / Anodizado</option><option value="negro">Negro</option>
              </select></FRow>
              <FRow label="Pistón (general)"><select style={sel} value={f.tipoPiston} onChange={e=>setF("tipoPiston",e.target.value)}><option value="skoN120">Hafele SKO N120</option><option value="n100">Hafele N100</option><option value="fuerzaInv">Hafele F. Inversa N100</option></select></FRow>
              <FRow label="Apertura (general)"><select style={sel} value={f.apertura||"melamina"} onChange={e=>setF("apertura",e.target.value)}>
                <optgroup label="Sin perfil">
                  <option value="melamina">Melamina (sin tirador)</option>
                  <option value="push">Push (sin tirador)</option>
                </optgroup>
                <optgroup label="Gola">
                  <option value="golaMadera">Gola Madera (trav color)</option>
                  <option value="alumBlanco">Gola Alum. Blanco</option>
                  <option value="alumNegro">Gola Alum. Negro</option>
                  <option value="alumNatural">Gola Alum. Natural</option>
                </optgroup>
                <optgroup label="Perfil MC">
                  <option value="perfilMC">Perfil MC</option>
                  <option value="perfilMH">Perfil MH</option>
                  <option value="perfilMJ">Perfil MJ</option>
                </optgroup>
                <optgroup label="Tirador / Manija">
                  <option value="class70">Tirador Class 70</option>
                  <option value="class70negro">Tirador Class 70 Negro</option>
                  <option value="barral96L">Tirador Barral 96mm L</option>
                  <option value="barral128L">Tirador Barral 128mm L</option>
                  <option value="udineNegro192">Tirador Udine Negro 192</option>
                  <option value="udineAlum192">Tirador Udine Alum 192</option>
                  <option value="manijaBarralInox128">Manija Barral Inox 128</option>
                  <option value="manijaBergamo96">Manija Bergamo 96</option>
                            <option value="tiradorBoton">Tirador Botón</option>
                            <option value="manijaBarralEsquel128">Manija Barral Esquel 128</option>
                </optgroup>
              </select></FRow>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:10}}>
              <FRow label="Base BM"><select style={sel} value={f.baseBM} onChange={e=>setF("baseBM",e.target.value)}><option value="banquina">Banquina de material</option><option value="patas">Patas plásticas</option></select></FRow>
              <FRow label={`Alt. Fin Alacenas (${(f.altFinAlacenas||2200)}mm → ${(f.altFinAlacenas||2200)-1500}mm alto)`}><input type="number" style={inp} value={(f.altFinAlacenas||2200)} onChange={e=>setF("altFinAlacenas",parseInt(e.target.value)||2200)}/></FRow>
              <FRow label={`Desp/Torres (auto: ${(f.altFinAlacenas||2200)-100}mm)`}><input type="number" style={inp} value={(f.altFinAlacenas||2200)-100} disabled/></FRow>
              {isAdmin && <FRow label="Rentabilidad"><select style={sel} value={f.rentabilidad} onChange={e=>setF("rentabilidad",parseInt(e.target.value))}>{RENTS.map(r=><option key={r} value={r}>{r}%</option>)}</select></FRow>}
            </div>
            {f.corredera==="matrix" && <div style={{marginTop:8}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,cursor:"pointer"}}>
                <input type="checkbox" checked={f.setBarraLat} onChange={e=>setF("setBarraLat",e.target.checked)}/> Set Barra Lateral 500
              </label>
            </div>}
            {isAdmin && <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,fontWeight:600,color:D}}>IVA (21%)</span>
              <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>setF("iva",!f.iva)}>
                <div style={{width:38,height:20,borderRadius:10,background:f.iva?G:"#d5cfc5",position:"relative",transition:".3s"}}><div style={{width:16,height:16,borderRadius:8,background:"#fff",position:"absolute",top:2,left:f.iva?20:2,transition:".3s",boxShadow:"0 1px 3px rgba(0,0,0,.15)"}}/></div>
                <span style={{fontSize:12}}>{f.iva?"Sí":"No"}</span>
              </div>
            </div>}
            {/* Placard-specific config */}
            {(pre.ambiente==="placard"||pre.ambiente==="vestidor") && <div style={{marginTop:10,padding:10,background:"#e0e7ff",borderRadius:8,border:"1px solid #c7d2fe"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#3730a3",marginBottom:6}}>👔 Configuración Placard</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                <div><label style={lbl}>Alto (mm)</label><input type="number" style={{...inp,fontSize:12}} value={f.altoPlacard||2600} onChange={e=>setF("altoPlacard",parseInt(e.target.value)||2600)}/></div>
                <div><label style={lbl}>Prof. exterior (mm)</label><input type="number" style={{...inp,fontSize:12}} value={f.profExt||600} onChange={e=>setF("profExt",parseInt(e.target.value)||600)}/></div>
                <div><label style={lbl}>Prof. interior (mm)</label><input type="number" style={{...inp,fontSize:12}} value={f.profInt||500} onChange={e=>setF("profInt",parseInt(e.target.value)||500)}/></div>
                <div><label style={lbl}>Banquina</label><select style={sel} value={f.banquinaPlacard||"material"} onChange={e=>setF("banquinaPlacard",e.target.value)}><option value="material">De material (obra)</option><option value="melamina">Zócalo melamina</option></select></div>
                <div><label style={lbl}>Kit Puertas</label><select style={sel} value={f.kitPlacard||"cl200"} onChange={e=>setF("kitPlacard",e.target.value)}>
                  <option value="cl150">Classic 1.50×2.60</option><option value="cl200">Classic 2.00×2.60</option><option value="cl300">Classic 3.00×2.60</option><option value="cl400">Classic 4.00×2.60</option><option value="sinPuertas">Sin puertas</option>
                </select></div>
                <div><label style={lbl}>Canto puerta (abajo)</label><select style={sel} value={f.cantoPuertaPlacard||"color04"} onChange={e=>setF("cantoPuertaPlacard",e.target.value)}>
                  <option value="blanco04">Blanco 0.4mm</option><option value="color04">Color 0.4mm</option>
                </select></div>
                <div style={{display:"flex",alignItems:"flex-end"}}>
                  <label style={{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>setF("ledPlacardLat",!f.ledPlacardLat)}>
                    <div style={{width:34,height:18,borderRadius:9,background:f.ledPlacardLat?G:"#d5cfc5",position:"relative",transition:".3s"}}><div style={{width:14,height:14,borderRadius:7,background:"#fff",position:"absolute",top:2,left:f.ledPlacardLat?18:2,transition:".3s"}}/></div>
                    💡 LED laterales
                  </label>
                </div>
              </div>
            </div>}
            <div style={{marginTop:10,padding:"6px 10px",background:"#f0fdf4",borderRadius:6,fontSize:10,color:"#166534"}}>
              💡 Bisagra, corredera, pistón, apertura y vidrio se pueden personalizar en cada módulo individual
            </div>
          </div>

          {/* ── MÓDULOS ── */}
          {(()=>{
            const ambCats = getCats(pre.ambiente);
            const validCat = ambCats.find(c=>c.id===catSel) ? catSel : ambCats[0]?.id||"bm";
            return <>
          <Sec icon="🗄️" title="Módulos"/>
          <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
            {ambCats.map(c=>(
              <button key={c.id} onClick={()=>setCatSel(c.id)} style={{padding:"5px 12px",borderRadius:7,border:validCat===c.id?`2px solid ${G}`:"1.5px solid #e0d8cc",background:validCat===c.id?"#fef9c3":"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:D}}>
                {c.icon} {c.nombre}
              </button>
            ))}
          </div>
          <div style={{...card,marginBottom:6}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220,1fr))",gap:6}}>
              {(ambCats.find(c=>c.id===validCat)?.mods||[]).map(mod=>(
                <div key={mod.id} style={{border:"1.5px solid #e0d8cc",borderRadius:8,padding:8,background:"#faf8f5"}}>
                  <div style={{fontSize:11,fontWeight:700,color:D,marginBottom:4}}>{mod.nombre}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {mod.anchos.map(a=>(
                      <button key={a} onClick={()=>{
                        if(mod.tipo==="albasc1p") {
                          const alto = prompt("Alto basculante (300-500mm):", "350");
                          if(alto) addMod(mod.id, a, parseInt(alto));
                        } else {
                          addMod(mod.id, a);
                        }
                      }} style={{padding:"2px 7px",borderRadius:5,border:`1px solid ${G}`,background:"transparent",color:G,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{a}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>; })()}

          {/* Módulos seleccionados */}
          {(pre.modulos||[]).length > 0 && <div style={card}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:6}}>Módulos Seleccionados</div>
            {(pre.modulos||[]).map((ms,i)=>{
              const mod = ALL_MODS.find(m=>m.id===ms.modId);
              if(!mod) return null;
              const c = calcModuloCosto(mod, ms.ancho, f, precios, ms.altoBasc, ms.ov);
              const catIcon = CATS.find(ct=>ct.id===mod.cat)?.icon || "";
              const isExp = expandedMod === ms.uid;
              const cBg = (z) => z==="Pta"?"#fef3c7":z==="TravF"?"#dbeafe":z==="Fondo"?"#f3e8ff":"#f0fdf4";
              const cTx = (z) => z==="Pta"?"#92400e":z==="TravF"?"#1e40af":z==="Fondo"?"#6b21a8":"#166534";
              return(
                <div key={ms.uid} style={{marginBottom:isExp?8:0}}>
                  <div style={{display:"grid",gridTemplateColumns:`24px 1fr auto ${user?.id==="guille"?"90px ":""}auto auto auto`,gap:8,alignItems:"center",padding:"6px 8px",background:i%2?"#faf8f5":"#fff",borderRadius:5,cursor:"pointer"}} onClick={()=>setExpandedMod(isExp?null:ms.uid)}>
                    <span style={{fontSize:12}}>{catIcon}</span>
                    <div><span style={{fontSize:12,fontWeight:600}}>{mod.nombre}</span> <span style={{fontSize:10,color:"#8a7d6b"}}>{ms.ancho}mm{ms.altoBasc?` h${ms.altoBasc}`:""}</span>{Object.values(ms.ov||{}).some(v=>v) && <span style={{fontSize:8,background:"#fef3c7",color:"#92400e",padding:"1px 4px",borderRadius:3,marginLeft:4}}>⚙️ custom</span>}</div>
                    <input type="number" min={1} value={ms.cantidad} onChange={e=>{e.stopPropagation();setModQ(ms.uid,e.target.value);}} onClick={e=>e.stopPropagation()} style={{width:40,padding:"2px 4px",borderRadius:4,border:"1px solid #e0d8cc",fontSize:11,textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}/>
                    {user?.id==="guille" && <span style={{fontSize:10,color:"#8a7d6b",textAlign:"right"}} title="Costo unitario">{$(c.total)}</span>}
                    {isAdmin && <span style={{fontSize:12,fontWeight:700,minWidth:90,textAlign:"right"}}>{$(c.total * ms.cantidad)}</span>}
                    {!isAdmin && <span style={{fontSize:12,fontWeight:700,minWidth:90,textAlign:"right",color:G}}>{$(c.total * (1+(f.rentabilidad||30)/100) * ms.cantidad)}</span>}
                    <button onClick={e=>{e.stopPropagation();rmMod(ms.uid);}} style={btnD}>×</button>
                    <span style={{fontSize:10,color:G,fontWeight:700}}>{isExp?"▲":"▼"}</span>
                  </div>
                  {isExp && c.piezas && <div style={{margin:"4px 0 6px 32px",border:"1px solid #e8e0d4",borderRadius:8,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>
                      <thead>
                        <tr style={{background:"#1a1a2e",color:"#fff"}}>
                          <th style={{padding:"5px 6px",textAlign:"left",fontWeight:600}}>Pieza</th>
                          <th style={{padding:"5px 4px",textAlign:"center",fontWeight:600,width:32}}>Cant</th>
                          <th style={{padding:"5px 4px",textAlign:"right",fontWeight:600,width:55}}>Largo</th>
                          <th style={{padding:"5px 4px",textAlign:"right",fontWeight:600,width:55}}>Ancho</th>
                          <th style={{padding:"5px 3px",textAlign:"center",fontWeight:600,width:26,background:"#c9a96e",color:"#1a1a2e"}}>S</th>
                          <th style={{padding:"5px 3px",textAlign:"center",fontWeight:600,width:26,background:"#c9a96e",color:"#1a1a2e"}}>I</th>
                          <th style={{padding:"5px 3px",textAlign:"center",fontWeight:600,width:26,background:"#c9a96e",color:"#1a1a2e"}}>Iz</th>
                          <th style={{padding:"5px 3px",textAlign:"center",fontWeight:600,width:26,background:"#c9a96e",color:"#1a1a2e"}}>D</th>
                          <th style={{padding:"5px 4px",textAlign:"right",fontWeight:600,width:55}}>ML</th>
                          <th style={{padding:"5px 4px",textAlign:"center",fontWeight:600,width:45}}>Zona</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.piezas.map((p,j)=>{
                          const ml = mlP(p);
                          return(
                            <tr key={j} style={{background:j%2?"#faf8f5":"#fff",borderBottom:"1px solid #f0ebe3"}}>
                              <td style={{padding:"4px 6px",fontWeight:500}}>{p.nombre}</td>
                              <td style={{padding:"4px",textAlign:"center"}}>{p.cant}</td>
                              <td style={{padding:"4px",textAlign:"right"}}>{p.largo}</td>
                              <td style={{padding:"4px",textAlign:"right"}}>{p.ancho}</td>
                              <td style={{padding:"4px",textAlign:"center",fontWeight:700,color:p.cSup?"#16a34a":"#d4d4d4"}}>{p.cSup}</td>
                              <td style={{padding:"4px",textAlign:"center",fontWeight:700,color:p.cInf?"#16a34a":"#d4d4d4"}}>{p.cInf}</td>
                              <td style={{padding:"4px",textAlign:"center",fontWeight:700,color:p.cIzq?"#16a34a":"#d4d4d4"}}>{p.cIzq}</td>
                              <td style={{padding:"4px",textAlign:"center",fontWeight:700,color:p.cDer?"#16a34a":"#d4d4d4"}}>{p.cDer}</td>
                              <td style={{padding:"4px",textAlign:"right",fontWeight:600}}>{ml.toFixed(3)}</td>
                              <td style={{padding:"2px 4px",textAlign:"center"}}><span style={{background:cBg(p.zona),color:cTx(p.zona),padding:"1px 5px",borderRadius:4,fontSize:9,fontWeight:600}}>{p.zona}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{background:"#f5f0e8",fontWeight:700}}>
                          <td style={{padding:"5px 6px"}} colSpan={4}>TOTAL</td>
                          <td style={{padding:"5px 3px",textAlign:"center"}}>{c.piezas.reduce((s,p)=>s+p.cant*p.cSup,0)}</td>
                          <td style={{padding:"5px 3px",textAlign:"center"}}>{c.piezas.reduce((s,p)=>s+p.cant*p.cInf,0)}</td>
                          <td style={{padding:"5px 3px",textAlign:"center"}}>{c.piezas.reduce((s,p)=>s+p.cant*p.cIzq,0)}</td>
                          <td style={{padding:"5px 3px",textAlign:"center"}}>{c.piezas.reduce((s,p)=>s+p.cant*p.cDer,0)}</td>
                          <td style={{padding:"5px 4px",textAlign:"right",color:G}}>
                            {(()=>{ const base=c.piezas.reduce((s,p)=>s+mlP(p),0); return <span>{base.toFixed(2)} <span style={{color:"#92400e",fontSize:8}}>+{(base*0.3).toFixed(2)}={(base*1.3).toFixed(2)}</span></span>; })()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>}
                  {/* Cost breakdown - solo Guille */}
                  {isExp && user?.id==="guille" && <div style={{margin:"0 0 6px 32px",padding:"8px 10px",background:"#fef9c3",borderRadius:8,fontSize:10,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:4}}>
                    <div>📦 Placas: <b>{$(c.costoPlacas||0)}</b></div>
                    <div>📏 Cantos: <b>{$(c.costoCantos||0)}</b> <span style={{color:"#92400e",fontSize:8}}>(+30%)</span></div>
                    <div>✂️ Corte: <b>{$(c.costoCorte||0)}</b> <span style={{color:"#92400e",fontSize:8}}>(+25%)</span></div>
                    <div>🧲 Pegado: <b>{$(c.costoPegado||0)}</b></div>
                    <div>🔩 Herrajes: <b>{$(c.costoHerr||0)}</b></div>
                    {(c.costoPatas||0)>0 && <div>🦶 Base: <b>{$(c.costoPatas)}</b></div>}
                    {(c.costoApertura||0)>0 && <div>🚪 Apertura: <b>{$(c.costoApertura)}</b></div>}
                    {(c.costoVidrio||0)>0 && <div>🪟 Vidrio: <b>{$(c.costoVidrio)}</b></div>}
                    <div style={{fontWeight:900,color:D}}>TOTAL: {$(c.total)}</div>
                  </div>}
                  {/* Per-module overrides */}
                  {isExp && <div style={{margin:"4px 0 6px 32px",padding:10,background:"#f9f7f4",borderRadius:8,border:"1px solid #e8e0d4"}}>
                    <div style={{fontSize:10,fontWeight:700,color:G,marginBottom:6}}>⚙️ Herrajes de este módulo <span style={{fontWeight:400,color:"#8a7d6b"}}>(vacío = usa config general)</span></div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150,1fr))",gap:6}}>
                      {mod.puertas > 0 && <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Bisagra</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).bisagra||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"bisagra",e.target.value);}}>
                          <option value="">General ({f.bisagra||"comun"})</option>
                          <option value="comun">Común</option><option value="cierreSuave">Cierre Suave</option><option value="push">Push</option>
                        </select>
                      </div>}
                      {(mod.cajones > 0 || ["torre1","torre3"].includes(mod.tipo)) && <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Corredera</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).corredera||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"corredera",e.target.value);}}>
                          <option value="">General ({f.corredera})</option>
                          <option value="comun">Telescópica Común</option><option value="cierreSuave">Telescópica CS</option>
                          <option value="push">Push</option><option value="matrix">Matrix Box</option><option value="lateral">Lat. Metálicos</option>
                        </select>
                      </div>}
                      {(mod.tipo.includes("basc") || mod.tipo.includes("micro") || mod.tipo.includes("torre")) && <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Pistón</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).piston||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"piston",e.target.value);}}>
                          <option value="">General ({f.tipoPiston})</option>
                          <option value="skoN120">Hafele SKO N120</option><option value="n100">Hafele N100</option><option value="fuerzaInv">Hafele F. Inversa N100</option>
                        </select>
                      </div>}
                      <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Apertura</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).apertura||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"apertura",e.target.value);}}>
                          <option value="">General ({f.apertura||"melamina"})</option>
                          <optgroup label="Sin perfil">
                            <option value="melamina">Melamina</option>
                            <option value="push">Push</option>
                          </optgroup>
                          <optgroup label="Gola">
                            <option value="golaMadera">Gola Madera</option>
                            <option value="alumBlanco">Gola Alum. Blanco</option>
                            <option value="alumNegro">Gola Alum. Negro</option>
                            <option value="alumNatural">Gola Alum. Natural</option>
                          </optgroup>
                          <optgroup label="Perfil MC">
                            <option value="perfilMC">Perfil MC</option>
                            <option value="perfilMH">Perfil MH</option>
                            <option value="perfilMJ">Perfil MJ</option>
                          </optgroup>
                          <optgroup label="Tirador / Manija">
                            <option value="class70">Tirador Class 70</option>
                            <option value="class70negro">Tirador Class 70 Negro</option>
                            <option value="barral96L">Tirador Barral 96mm L</option>
                            <option value="barral128L">Tirador Barral 128mm L</option>
                            <option value="udineNegro192">Tirador Udine Negro 192</option>
                            <option value="udineAlum192">Tirador Udine Alum 192</option>
                            <option value="manijaBarralInox128">Manija Barral Inox 128</option>
                            <option value="manijaBergamo96">Manija Bergamo 96</option>
                            <option value="tiradorBoton">Tirador Botón</option>
                            <option value="manijaBarralEsquel128">Manija Barral Esquel 128</option>
                          </optgroup>
                        </select>
                      </div>
                      {mod.cat==="al" && <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Vidrio</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).vidrio||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"vidrio",e.target.value);}}>
                          <option value="">Sin vidrio</option>
                          <option value="incoloro">Incoloro</option><option value="bronce">Bronce</option><option value="espejado">Espejado</option>
                        </select>
                      </div>}
                      {mod.cat==="al" && (ms.ov||{}).vidrio && <div>
                        <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Perfil Vidrio</label>
                        <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).perfilVidrio||"top2045"} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"perfilVidrio",e.target.value);}}>
                          <option value="top2045">Top 20×45</option><option value="sierra">Sierra</option>
                          <option value="interNegro">Inter Negro</option><option value="interAlum">Inter Aluminio</option>
                        </select>
                      </div>}
                    </div>
                    {/* Personalizable: placa/canto overrides per module */}
                    {isPersonal && <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed #c9a96e"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#b45309",marginBottom:6}}>🎨 Materiales de este módulo</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150,1fr))",gap:6}}>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Placa Interior</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).interior||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"interior",e.target.value);}}>
                            <option value="">General ({f.interior})</option>
                            <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                            <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Placa Puerta/Frente</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).puerta||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"puerta",e.target.value);}}>
                            <option value="">General ({f.puerta})</option>
                            <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                            <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option><option value="gloss">Gloss</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Color Fondo</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).colorFondo||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"colorFondo",e.target.value);}}>
                            <option value="">General ({f.colorFondo})</option>
                            <option value="blanco">Blanco</option><option value="color">Color</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Canto Frontal</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).cantoFrontal||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"cantoFrontal",e.target.value);}}>
                            <option value="">General ({f.cantoFrontal})</option>
                            <option value="blanco04">Blanco 0,4</option><option value="color04">Color 0,4</option>
                            <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Canto Interior</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).cantoInt||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"cantoInt",e.target.value);}}>
                            <option value="">General ({f.cantoInt})</option>
                            <option value="blanco04">Blanco 0,4</option><option value="color04">Color 0,4</option>
                            <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Canto Puerta</label>
                          <select style={{...sel,fontSize:10,padding:"3px 4px"}} value={(ms.ov||{}).cantoPuerta||""} onChange={e=>{e.stopPropagation();setModOv(ms.uid,"cantoPuerta",e.target.value);}}>
                            <option value="">General ({f.cantoPuerta})</option>
                            <option value="blanco04">Blanco 0,4</option><option value="color04">Color 0,4</option>
                            <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option>
                            <option value="gloss1">Gloss 1mm</option>
                          </select>
                        </div>
                      </div>
                      {/* Per-module tapas */}
                      <div style={{marginTop:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <label style={{fontSize:9,color:"#8a7d6b",fontWeight:600}}>Tapas de terminación</label>
                          <div style={{display:"flex",gap:4}}>
                            {["izq","der","ambas"].map(lado=>{
                              const hasTapa = ((ms.ov||{}).tapas||[]).some(t=>t.lado===lado);
                              return <button key={lado} onClick={e=>{e.stopPropagation();
                                const tapas = [...((ms.ov||{}).tapas||[])];
                                if(hasTapa) { setModOv(ms.uid,"tapas",tapas.filter(t=>t.lado!==lado)); }
                                else { tapas.push({lado,material:f.interior||"agloBlanco",canto:f.cantoFrontal||"blanco04"}); setModOv(ms.uid,"tapas",tapas); }
                              }} style={{fontSize:8,padding:"2px 6px",borderRadius:4,border:`1px solid ${hasTapa?G:"#ccc"}`,background:hasTapa?"#fef9c3":"transparent",color:hasTapa?D:"#999",cursor:"pointer",fontWeight:600}}>
                                {lado==="izq"?"◀ Izq":lado==="der"?"Der ▶":"◀▶ Ambas"}{hasTapa?" ✓":""}
                              </button>;
                            })}
                          </div>
                        </div>
                        {((ms.ov||{}).tapas||[]).map((tp,ti)=>(
                          <div key={ti} style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr",gap:6,marginTop:4,alignItems:"center"}}>
                            <span style={{fontSize:9,fontWeight:700,color:D}}>{tp.lado==="izq"?"◀ Izq":tp.lado==="der"?"Der ▶":"◀▶ Ambas"}</span>
                            <select style={{...sel,fontSize:9,padding:"2px 3px"}} value={tp.material} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();const tapas=[...((ms.ov||{}).tapas||[])];tapas[ti]={...tapas[ti],material:e.target.value};setModOv(ms.uid,"tapas",tapas);}}>
                              <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                              <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option><option value="gloss">Gloss</option>
                            </select>
                            <select style={{...sel,fontSize:9,padding:"2px 3px"}} value={tp.canto} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();const tapas=[...((ms.ov||{}).tapas||[])];tapas[ti]={...tapas[ti],canto:e.target.value};setModOv(ms.uid,"tapas",tapas);}}>
                              <option value="blanco04">Blanco 0,4</option><option value="color04">Color 0,4</option>
                              <option value="blanco2">Blanco 2mm</option><option value="color2">Color 2mm</option><option value="gloss1">Gloss 1mm</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>}
                    {Object.values(ms.ov||{}).some(v=>v) && <div style={{marginTop:4,fontSize:9,color:"#dc2626",cursor:"pointer"}} onClick={e=>{e.stopPropagation();updPre(pre.id,{modulos:(pre.modulos||[]).map(m=>m.uid===ms.uid?{...m,ov:{}}:m)});}}>✕ Resetear a config general</div>}
                    {/* Mini cost breakdown */}
                    {isAdmin && <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid #e8e0d4",display:"flex",flexWrap:"wrap",gap:8,fontSize:9,color:"#6b7280"}}>
                      <span>Placas: <b>{$(c.costoPlacas)}</b></span>
                      <span>Cantos <span style={{color:"#92400e"}}>(+30%)</span>: <b>{$(c.costoCantos)}</b></span>
                      <span>Herrajes: <b>{$(c.costoHerr)}</b></span>
                      <span>Corte <span style={{color:"#92400e"}}>(+25%)</span>: <b>{$(c.costoCorte)}</b></span>
                      <span>Pegado: <b>{$(c.costoPegado)}</b></span>
                      {c.costoPatas>0 && <span>Patas: <b>{$(c.costoPatas)}</b></span>}
                      {c.costoApertura>0 && <span style={{color:"#b45309"}}>Apertura: <b>{$(c.costoApertura)}</b></span>}
                      {c.costoVidrio>0 && <span style={{color:"#7c3aed"}}>Vidrio: <b>{$(c.costoVidrio)}</b></span>}
                      <span style={{color:D,fontWeight:700}}>TOTAL: {$(c.total)}</span>
                    </div>}
                  </div>}
                </div>
              );
            })}
          </div>}

          {/* ── ACCESORIOS ── */}
          <Sec icon="🔧" title="Accesorios"/>
          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130,1fr))",gap:8}}>
              {accesorios.filter(a=>a.precio>0).map(a=>(
                <div key={a.id} style={{border:"1px solid #e0d8cc",borderRadius:7,padding:6,textAlign:"center",background:"#faf8f5"}}>
                  {a.img && <div style={{width:"100%",height:50,borderRadius:5,background:`url(${a.img}) center/cover`,marginBottom:4}}/>}
                  <div style={{fontSize:10,fontWeight:600}}>{a.nombre}</div>
                  {isAdmin && <div style={{fontSize:10,color:G,fontWeight:700}}>{$(a.precio)}</div>}
                  <input type="number" min={0} value={(pre.accCant||{})[a.id]||0} onChange={e=>setAccQ(a.id,e.target.value)} style={{width:40,padding:"2px",borderRadius:4,border:"1px solid #e0d8cc",fontSize:11,textAlign:"center",marginTop:3,fontFamily:"'DM Sans',sans-serif"}}/>
                </div>
              ))}
              {accesorios.filter(a=>a.precio>0).length===0 && <p style={{fontSize:11,color:"#a09880"}}>Cargá precios en "Accesorios".</p>}
            </div>
            <div style={{marginTop:10,display:"flex",gap:10,alignItems:"center"}}>
              <label style={{fontSize:11,fontWeight:600,color:"#8a7d6b"}}>LED (metros):</label>
              <input type="number" min={0} value={pre.metrosLed||0} onChange={e=>updPre(pre.id,{metrosLed:parseFloat(e.target.value)||0})} style={{width:60,padding:"3px 6px",borderRadius:5,border:"1px solid #e0d8cc",fontSize:11,textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}/>
              <span style={{fontSize:10,color:"#8a7d6b"}}>{isAdmin ? $((pre.metrosLed||0)*precios.ledMl) : ""}</span>
            </div>
          </div>

          {/* ── PIEZAS MANUALES ── */}
          <Sec icon="📐" title="Piezas Manuales" right={<button onClick={addPM} style={btnO}>+ Pieza</button>}/>
          {(pre.piezasManuales||[]).length > 0 && <div style={card}>
            {(pre.piezasManuales||[]).map(pm=>(
              <div key={pm.uid} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f0ebe3"}}>
                <input type="number" placeholder="Largo mm" value={pm.largo||""} onChange={e=>updPM(pm.uid,"largo",parseInt(e.target.value)||0)} style={{width:80,...inp,padding:"4px 6px",fontSize:11}}/>
                <span style={{fontSize:10}}>×</span>
                <input type="number" placeholder="Ancho mm" value={pm.ancho||""} onChange={e=>updPM(pm.uid,"ancho",parseInt(e.target.value)||0)} style={{width:80,...inp,padding:"4px 6px",fontSize:11}}/>
                <input type="number" min={1} value={pm.cantidad||1} onChange={e=>updPM(pm.uid,"cantidad",parseInt(e.target.value)||1)} style={{width:40,...inp,padding:"4px",fontSize:11,textAlign:"center"}}/>
                <span style={{fontSize:10,color:"#8a7d6b"}}>Canto: 1L+2C</span>
                <button onClick={()=>rmPM(pm.uid)} style={btnD}>×</button>
              </div>
            ))}
          </div>}

          {/* ── ESTANTES FLOTANTES ── */}
          <Sec icon="📏" title="Estantes Flotantes" right={<button onClick={addEF} style={btnO}>+ Estante</button>}/>
          {(pre.estFlotantes||[]).length > 0 && <div style={card}>
            {(pre.estFlotantes||[]).map(ef=>(
              <div key={ef.uid} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f0ebe3"}}>
                <label style={{fontSize:10}}>Ancho:</label>
                <input type="number" value={ef.ancho||""} onChange={e=>updEF(ef.uid,"ancho",parseInt(e.target.value)||0)} style={{width:70,...inp,padding:"4px 6px",fontSize:11}}/>
                <label style={{fontSize:10}}>Prof:</label>
                <input type="number" value={ef.prof||""} onChange={e=>updEF(ef.uid,"prof",parseInt(e.target.value)||0)} style={{width:70,...inp,padding:"4px 6px",fontSize:11}}/>
                <button onClick={()=>rmEF(ef.uid)} style={btnD}>×</button>
              </div>
            ))}
          </div>}

          {/* ── TAPAS DE TERMINACIÓN ── */}
          <Sec icon="🪵" title="Tapas de Terminación" right={<button onClick={addTapa} style={btnO}>+ Tapa</button>}/>
          {(pre.tapasTerminacion||[]).length > 0 && <div style={card}>
            {(pre.tapasTerminacion||[]).map(tp=>{
              const altAl_ = getAltAl(f);
              const largo = tp.tipo==="bm" ? 800 : altAl_;
              const ancho = tp.tipo==="bm" ? 562 : 332;
              return <div key={tp.uid} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f0ebe3",flexWrap:"wrap"}}>
                <select value={tp.tipo} onChange={e=>updTapa(tp.uid,"tipo",e.target.value)} style={{...sel,width:80,padding:"4px 4px",fontSize:11}}>
                  <option value="bm">Bajo Mesada</option><option value="al">Alacena</option>
                </select>
                <select value={tp.material||"agloBlanco"} onChange={e=>updTapa(tp.uid,"material",e.target.value)} style={{...sel,width:110,padding:"4px 4px",fontSize:11}}>
                  <option value="agloBlanco">Aglo Blanco</option><option value="agloColor">Aglo Color</option>
                  <option value="mdfBlanco">MDF Blanco</option><option value="mdfColor">MDF Color</option>
                  <option value="gloss">Gloss</option>
                </select>
                <select value={tp.canto||"blanco04"} onChange={e=>updTapa(tp.uid,"canto",e.target.value)} style={{...sel,width:110,padding:"4px 4px",fontSize:11}}>
                  <option value="blanco04">Canto Blanco 0,4</option><option value="color04">Canto Color 0,4</option>
                  <option value="blanco2">Canto Blanco 2mm</option><option value="color2">Canto Color 2mm</option>
                  <option value="gloss1">Canto Gloss 1mm</option>
                </select>
                <input type="number" min={1} value={tp.cantidad||1} onChange={e=>updTapa(tp.uid,"cantidad",parseInt(e.target.value)||1)} style={{width:40,...inp,padding:"4px",fontSize:11,textAlign:"center"}} title="Cantidad"/>
                <span style={{fontSize:10,color:"#8a7d6b"}}>{largo}×{ancho}mm</span>
                <span style={{fontSize:9,color:"#a09880"}}>canto: 1L+2C</span>
                <button onClick={()=>rmTapa(tp.uid)} style={btnD}>×</button>
              </div>;
            })}
          </div>}

          {/* ── OBSERVACIONES Y COLOR ── */}
          <Sec icon="📝" title="Observaciones y Color"/>
          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={lbl}>Color / Materiales</label>
                <textarea style={{...inp,minHeight:50,resize:"vertical",fontSize:11}} value={pre.colorSpec||""} onChange={e=>updPre(pre.id,{colorSpec:e.target.value})} placeholder="Ej: Interior Roble Santana, Puertas Gris Grafito, Cantos color 2mm..."/>
              </div>
              <div>
                <label style={lbl}>Observaciones</label>
                <textarea style={{...inp,minHeight:50,resize:"vertical",fontSize:11}} value={pre.observaciones||""} onChange={e=>updPre(pre.id,{observaciones:e.target.value})} placeholder="Notas adicionales del presupuesto..."/>
              </div>
            </div>
          </div>

          {/* ── ENVÍO ── */}
          <Sec icon="🚚" title="Envío"/>
          <div style={card}>
            {(()=>{
              const cl = clientes.find(c=>c.id===pre.clienteId);
              const dirCli = cl?.direccion || "";
              const dirOrigen = precios.direccionOrigen || "Córdoba, Argentina";
              const mapsUrl = dirCli ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(dirOrigen)}&destination=${encodeURIComponent(dirCli)}&travelmode=driving` : "";
              const km = pre.kmEnvio || 0;
              const costoEnvio = km * (precios.precioKm || 0);
              return <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <label style={{fontSize:11,fontWeight:600,color:"#8a7d6b"}}>Km:</label>
                <input type="number" min={0} value={km||""} onChange={e=>updPre(pre.id,{kmEnvio:parseFloat(e.target.value)||0})} style={{width:70,padding:"4px 6px",borderRadius:5,border:"1px solid #e0d8cc",fontSize:12,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontWeight:700}} placeholder="0"/>
                {isAdmin && <span style={{fontSize:10,color:"#8a7d6b"}}>× {$(precios.precioKm||0)}/km</span>}
                {km > 0 && <span style={{fontSize:12,fontWeight:700,color:G}}>= {$(costoEnvio)}</span>}
                {dirCli && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#3b82f6",textDecoration:"none",padding:"4px 10px",border:"1px solid #3b82f6",borderRadius:6,fontWeight:600}}>📍 Ver ruta en Google Maps</a>}
                {!dirCli && <span style={{fontSize:10,color:"#dc2626"}}>⚠ Cargá la dirección del cliente</span>}
              </div>;
            })()}
          </div>

          </div>{/* end lockStyle */}

          {/* ── RESUMEN ── */}
          <Sec icon="📊" title="Resumen"/>
          {preTots && <div style={{background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",borderRadius:12,padding:16}}>
            {isAdmin && (()=>{
              const items = [
                ["Costo Materiales",preTots.tm],
                ["Accesorios",preTots.ta],
                ["LED",preTots.tled],
                ["Estantes Flotantes",preTots.tef],
                ["Ítems Extras",preTots.textra],
              ].filter(([,v])=> (v||0) > 0);
              return <>
                {items.map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <span style={{color:"#a09880",fontSize:12}}>{l}</span>
                    <span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{$(v)}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 5px",borderTop:"2px solid rgba(255,255,255,.15)",marginTop:4}}>
                  <span style={{color:"#e8c47c",fontSize:13,fontWeight:700}}>Subtotal</span>
                  <span style={{fontWeight:900,fontSize:16,color:"#e8c47c"}}>{$(preTots.sub)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#7dd3a0",fontSize:12}}>+ Rentabilidad ({f.rentabilidad}%)</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#7dd3a0"}}>+ {$(preTots.rent)}</span>
                </div>
                {(preTots.tenvio||0) > 0 && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#fbbf24",fontSize:12}}>🚚 Envío ({pre.kmEnvio||0} km)</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#fbbf24"}}>+ {$(preTots.tenvio)}</span>
                </div>}
                {f.iva && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#93c5fd",fontSize:12}}>+ IVA (21%)</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#93c5fd"}}>+ {$(preTots.ivaAmt)}</span>
                </div>}
              </>;
            })()}
            {!isAdmin && <div style={{padding:"8px 0"}}>
              <div style={{fontSize:12,color:"#a09880",marginBottom:4}}>{(pre.modulos||[]).length} módulos configurados</div>
              {(preTots.tenvio||0) > 0 && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                <span style={{color:"#fbbf24",fontSize:12}}>🚚 Transporte</span>
                <span style={{fontWeight:700,fontSize:14,color:"#fbbf24"}}>{$(preTots.tenvio)}</span>
              </div>}
              {f.iva && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                <span style={{color:"#93c5fd",fontSize:12}}>IVA (21%)</span>
                <span style={{fontWeight:700,fontSize:14,color:"#93c5fd"}}>{$(preTots.ivaAmt)}</span>
              </div>}
            </div>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 2px",marginTop:4}}>
              <span style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#e8c47c"}}>TOTAL FINAL</span>
              <span style={{fontSize:20,fontWeight:900,fontFamily:"'Playfair Display',serif",color:"#e8c47c"}}>{$(preTots.total)}</span>
            </div>
          </div>}

          {/* ── GENERAR PRESUPUESTO PARA CLIENTE ── */}
          {preTots && <div style={{textAlign:"center",marginTop:16,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setView("printPre")} style={{padding:"12px 30px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${D},${D2})`,color:"#e8c47c",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',serif",letterSpacing:.5,boxShadow:"0 4px 15px rgba(26,26,46,.3)"}}>
              📄 Presupuesto Cliente
            </button>
            {isAdmin && <button onClick={()=>setView("planilla")} style={{padding:"12px 30px",borderRadius:10,border:`2px solid ${G}`,background:"transparent",color:G,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',serif",letterSpacing:.5}}>
              📋 Planilla de Materiales
            </button>}
          </div>}
        </>;
        })()}

        {/* ════ PRESUPUESTO IMPRIMIBLE ════ */}
        {view==="printPre" && pre && (()=>{
          const cl = clientes.find(c=>c.id===pre.clienteId);
          const tots = calcPresupTotal(pre, precios, accesorios);
          const mk = 1 + (f.rentabilidad / 100);
          const pPlacaIntPrint = {agloBlanco:precios.placaAgloBlanco,agloColor:precios.placaAgloColor,mdfBlanco:precios.placaMdfBlanco,mdfColor:precios.placaMdfColor}[f.interior]||precios.placaAgloBlanco;
          const mods = (pre.modulos||[]).map(ms=>{
            const mod = ALL_MODS.find(m=>m.id===ms.modId);
            if(!mod) return null;
            const c = calcModuloCosto(mod, ms.ancho, f, precios, ms.altoBasc, ms.ov);
            const catNom = CATS.find(ct=>ct.id===mod.cat)?.nombre || "";
            return { ...ms, mod, catNom, precioFinal: c.total * mk };
          }).filter(Boolean);
          const accUsados = accesorios.filter(a=>(pre.accCant||{})[a.id]>0);
          const totalSinIva = tots.sub + tots.rent + tots.tenvio;
          const totalConIva = totalSinIva * 1.21;

          const ps = {fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#333"};
          const hdr = {fontFamily:"'Playfair Display',serif",fontWeight:700};
          const tbl = {width:"100%",borderCollapse:"collapse",fontSize:11};
          const th_ = {padding:"8px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left",textTransform:"uppercase",letterSpacing:.5};
          const td_ = {padding:"7px 10px",borderBottom:"1px solid #eee"};
          const tdR = {...td_,textAlign:"right",fontWeight:600};

          const pdfName = [cl?.nombre||"Presupuesto", cl?.telefono||"", pre.fecha||""].filter(Boolean).join(" - ").replace(/[\/\\:*?"<>|]/g,"_");

          return <>
            <style>{`@media print { .no-print { display:none !important; } body { margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; } }`}</style>
            <div className="no-print" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={()=>setView("editPre")} style={btnO}>← Volver al editor</button>
              <button onClick={()=>doPrint(printRef.current, pdfName)} style={{...btnG,fontSize:13}}>📥 Descargar PDF</button>
            </div>

            <div ref={printRef} style={{background:"#fff",maxWidth:800,margin:"0 auto",padding:40,borderRadius:4,boxShadow:"0 2px 20px rgba(0,0,0,.08)",...ps}}>

              {/* HEADER AMOBLEX */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:16,borderBottom:`3px solid ${G}`}}>
                  <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:36,fontWeight:300,color:"#1a1a2e",letterSpacing:6,textTransform:"uppercase"}}>Amoblex</div>
                  <div style={{textAlign:"right",fontSize:10,color:"#666",lineHeight:1.6}}>
                    <div>Av. Monseñor Pablo Cabrera 2870, Local 6</div>
                    <div>📱 351-703-6419</div>
                    <div>✉ amoblex@gmail.com</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                  <div>
                    <div style={{...hdr,fontSize:20,color:D}}>PRESUPUESTO</div>
                    <div style={{fontSize:11,color:G,fontWeight:600,letterSpacing:1,marginTop:2}}>{(AMB_LABELS[pre.ambiente||"cocina"]||"").toUpperCase()} A MEDIDA</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{...hdr,fontSize:16,color:G}}>N° {String(pre.numero).padStart(4,"0")}</div>
                    <div style={{fontSize:11,color:"#666",marginTop:4}}>Fecha: {new Date(pre.fecha).toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"})}</div>
                  </div>
                </div>
              </div>

              {/* CLIENTE */}
              {cl && <div style={{background:"#f9f7f4",borderRadius:8,padding:16,marginBottom:24,border:"1px solid #eee"}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:G,marginBottom:8}}>Cliente</div>
                <div style={{...hdr,fontSize:18,color:D}}>{cl.nombre}</div>
                <div style={{display:"flex",gap:20,marginTop:6,flexWrap:"wrap",fontSize:12,color:"#666"}}>
                  {cl.telefono && <span>Tel: {cl.telefono}</span>}
                  {cl.email && <span>Email: {cl.email}</span>}
                  {cl.direccion && <span>Dir: {cl.direccion}</span>}
                </div>
              </div>}

              {/* ESPECIFICACIONES */}
              <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Especificaciones</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,fontSize:11}}>
                  {[
                    ["Interior", ({"agloBlanco":"Aglo Blanco","agloColor":"Aglo Color","mdfBlanco":"MDF Blanco","mdfColor":"MDF Color"}[f.interior||"agloBlanco"]||f.interior) + (f.descInterior?" — "+f.descInterior:"")],
                    ["Puerta/Frente", ({"agloBlanco":"Aglo Blanco","agloColor":"Aglo Color","mdfBlanco":"MDF Blanco","mdfColor":"MDF Color","gloss":"Gloss"}[f.puerta]||f.puerta) + (f.descPuerta?" — "+f.descPuerta:"")],
                    ["Fondo", (f.colorFondo==="color"?"Color":"Blanco") + (f.descFondo?" — "+f.descFondo:"")],
                    ["Canto Int. (trasero)", {"blanco04":"Blanco 0,4","color04":"Color 0,4","blanco2":"Blanco 2","color2":"Color 2"}[f.cantoInt]||"Blanco 0,4"],
                    ["Canto Front. (lat/base/trav)", {"blanco04":"Blanco 0,4","color04":"Color 0,4","blanco2":"Blanco 2","color2":"Color 2"}[f.cantoFrontal]||"Blanco 0,4"],
                    ["Canto Puerta", {"blanco04":"Blanco 0,4","color04":"Color 0,4","blanco2":"Blanco 2","color2":"Color 2","gloss1":"Gloss 1mm"}[f.cantoPuerta]||"Blanco 0,4"],
                    ["Apertura", {"melamina":"Melamina","golaMadera":"Gola Madera","alumBlanco":"Gola Alum. Blanco","alumNegro":"Gola Alum. Negro","alumNatural":"Gola Alum. Natural","perfilMC":"Perfil MC","perfilMH":"Perfil MH","perfilMJ":"Perfil MJ","push":"Push","class70":"Tirador Class 70","class70negro":"Tirador Class 70 Negro","barral96L":"Barral 96mm","barral128L":"Barral 128mm","udineNegro192":"Udine Negro 192","udineAlum192":"Udine Alum 192","manijaBarralInox128":"Manija Barral Inox 128","manijaBergamo96":"Manija Bergamo 96","tiradorBoton":"Tirador Botón","manijaBarralEsquel128":"Barral Esquel 128"}[f.apertura]||f.apertura],
                    ["Bisagra", (f.bisagra||"comun") + " — " + (f.colorHerraje==="negro"?"negro":"aluminio")],
                    ["Corredera", f.corredera + " " + (f.correderaMedida||"50") + "cm — " + (f.colorHerraje==="negro"?"negro":"aluminio")],
                    ["Base", f.baseBM==="patas"?"Patas":"Banquina"],
                  ].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",gap:4}}>
                      <span style={{color:"#999",fontWeight:600}}>{l}:</span>
                      <span style={{fontWeight:500,textTransform:"capitalize"}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABLA MÓDULOS */}
              <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Detalle de Módulos</div>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={th_}>Módulo</th>
                      <th style={{...th_,textAlign:"center",width:70}}>Ancho</th>
                      <th style={{...th_,textAlign:"center",width:40}}>Cant</th>
                      <th style={{...th_,textAlign:"right",width:110}}>Precio Unit.</th>
                      <th style={{...th_,textAlign:"right",width:110}}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(()=>{
                      let lastCat = "";
                      return mods.map((m,i)=>{
                        const showCat = m.catNom !== lastCat;
                        lastCat = m.catNom;
                        return [
                          showCat && <tr key={"cat"+i}><td colSpan={5} style={{padding:"10px 10px 4px",fontWeight:700,fontSize:11,color:G,textTransform:"uppercase",letterSpacing:1,borderBottom:`2px solid ${G}22`}}>{m.catNom}</td></tr>,
                          <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                            <td style={td_}>{m.mod.nombre}{m.altoBasc ? ` (h${m.altoBasc})` : ""}</td>
                            <td style={{...td_,textAlign:"center"}}>{m.ancho}mm</td>
                            <td style={{...td_,textAlign:"center"}}>{m.cantidad}</td>
                            <td style={tdR}>{$(m.precioFinal)}</td>
                            <td style={{...tdR,color:D}}>{$(m.precioFinal * m.cantidad)}</td>
                          </tr>
                        ];
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#f5f2ed"}}>
                      <td style={{...td_,fontWeight:700}} colSpan={3}>Total Módulos ({mods.reduce((s,m)=>s+m.cantidad,0)} unidades)</td>
                      <td colSpan={2} style={{...tdR,fontSize:14,color:D,fontWeight:800}}>{$(mods.reduce((s,m)=>s+m.precioFinal*m.cantidad,0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* ACCESORIOS CON FOTOS */}
              {accUsados.length > 0 && <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Accesorios Incluidos</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140,1fr))",gap:12}}>
                  {accUsados.map(a=>{
                    const qty = (pre.accCant||{})[a.id]||0;
                    return(
                      <div key={a.id} style={{border:"1px solid #eee",borderRadius:8,overflow:"hidden",textAlign:"center"}}>
                        {a.img && <div style={{width:"100%",height:90,background:`url(${a.img}) center/cover`}}/>}
                        {!a.img && <div style={{width:"100%",height:90,background:"#f5f2ed",display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",fontSize:28}}>📦</div>}
                        <div style={{padding:8}}>
                          <div style={{fontSize:11,fontWeight:700,color:D}}>{a.nombre}</div>
                          <div style={{fontSize:10,color:"#888",marginTop:2}}>Cant: {qty}</div>
                          <div style={{fontSize:12,fontWeight:700,color:G,marginTop:2}}>{$(a.precio * qty)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{textAlign:"right",marginTop:10,fontSize:13,fontWeight:700,color:D}}>Total Accesorios: {$(tots.ta)}</div>
              </div>}

              {/* PIEZAS MANUALES */}
              {(pre.piezasManuales||[]).filter(pm=>pm.largo>0&&pm.ancho>0).length > 0 && <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Piezas Especiales</div>
                <table style={tbl}>
                  <thead><tr><th style={th_}>Pieza</th><th style={{...th_,textAlign:"center"}}>Medida</th><th style={{...th_,textAlign:"center"}}>Cant</th><th style={{...th_,textAlign:"right"}}>Precio</th></tr></thead>
                  <tbody>
                    {(pre.piezasManuales||[]).filter(pm=>pm.largo>0&&pm.ancho>0).map((pm,i)=>{
                      const area = (pm.largo * pm.ancho) / 1e6;
                      const cost = area * pPlacaIntPrint * (pm.cantidad||1) * mk;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={td_}>Pieza especial {i+1}</td>
                        <td style={{...td_,textAlign:"center"}}>{pm.largo} × {pm.ancho} mm</td>
                        <td style={{...td_,textAlign:"center"}}>{pm.cantidad||1}</td>
                        <td style={tdR}>{$(cost)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>}

              {/* LED y ESTANTES */}
              {((pre.metrosLed||0) > 0 || (pre.estFlotantes||[]).length > 0) && <div style={{marginBottom:24}}>
                {(pre.metrosLed||0) > 0 && <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#f9f7f4",borderRadius:6,fontSize:12,marginBottom:6}}>
                  <span><strong>Iluminación LED:</strong> {pre.metrosLed} metros lineales</span>
                  <span style={{fontWeight:700,color:D}}>{$(tots.tled * mk)}</span>
                </div>}
                {(pre.estFlotantes||[]).length > 0 && <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#f9f7f4",borderRadius:6,fontSize:12}}>
                  <span><strong>Estantes Flotantes:</strong> {(pre.estFlotantes||[]).map(ef=>`${ef.ancho}×${ef.prof}mm`).join(", ")}</span>
                  <span style={{fontWeight:700,color:D}}>{$(tots.tef * mk)}</span>
                </div>}
              </div>}

              {/* TAPAS DE TERMINACIÓN */}
              {(pre.tapasTerminacion||[]).length > 0 && <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Tapas de Terminación</div>
                <table style={tbl}>
                  <thead><tr><th style={th_}>Tipo</th><th style={{...th_,textAlign:"center"}}>Material</th><th style={{...th_,textAlign:"center"}}>Medida</th><th style={{...th_,textAlign:"center"}}>Cant</th><th style={{...th_,textAlign:"right"}}>Precio</th></tr></thead>
                  <tbody>
                    {(pre.tapasTerminacion||[]).map((tp,i)=>{
                      const altAlP = getAltAl(f);
                      const largo = tp.tipo==="bm" ? 800 : altAlP;
                      const ancho = tp.tipo==="bm" ? 562 : 332;
                      const matLabel = {"agloBlanco":"Aglo Blanco","agloColor":"Aglo Color","mdfBlanco":"MDF Blanco","mdfColor":"MDF Color","gloss":"Gloss"}[tp.material]||tp.material;
                      const area = (largo * ancho) / 1e6;
                      const pPlTp = ({agloBlanco:precios.placaAgloBlanco,agloColor:precios.placaAgloColor,mdfBlanco:precios.placaMdfBlanco,mdfColor:precios.placaMdfColor,gloss:precios.placaGloss}[tp.material]||pPlacaIntPrint);
                      const cost = area * pPlTp * (tp.cantidad||1) * mk;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={td_}>{tp.tipo==="bm"?"Bajo Mesada":"Alacena"}</td>
                        <td style={{...td_,textAlign:"center"}}>{matLabel}</td>
                        <td style={{...td_,textAlign:"center"}}>{largo} × {ancho} mm</td>
                        <td style={{...td_,textAlign:"center"}}>{tp.cantidad||1}</td>
                        <td style={tdR}>{$(cost)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>}

              {/* ÍTEMS ADICIONALES — integrados como ítems normales */}
              {(pre.itemsExtra||[]).length > 0 && <div style={{marginBottom:24}}>
                <table style={tbl}>
                  <thead><tr><th style={th_}>Ítem</th><th style={{...th_,textAlign:"center",width:60}}>Cant.</th><th style={{...th_,textAlign:"right",width:100}}>Precio</th></tr></thead>
                  <tbody>
                    {(pre.itemsExtra||[]).map((it,i)=>(
                      <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={td_}>{it.descripcion||"—"}</td>
                        <td style={{...td_,textAlign:"center"}}>{it.cantidad||0} {it.unidad||"u"}</td>
                        <td style={tdR}>{$((it.precioUnit||0)*(it.cantidad||0)*mk)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}

              {/* OBSERVACIONES Y COLOR */}
              {(pre.colorSpec || pre.observaciones) && <div style={{marginBottom:20}}>
                {pre.colorSpec && <div style={{padding:12,background:"#fef9c3",borderRadius:8,borderLeft:`3px solid ${G}`,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#92400e",marginBottom:4}}>🎨 COLOR / MATERIALES</div>
                  <div style={{fontSize:11,color:"#555",whiteSpace:"pre-wrap"}}>{pre.colorSpec}</div>
                </div>}
                {pre.observaciones && <div style={{padding:12,background:"#f0fdf4",borderRadius:8,borderLeft:`3px solid #16a34a`}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#166534",marginBottom:4}}>📝 OBSERVACIONES</div>
                  <div style={{fontSize:11,color:"#555",whiteSpace:"pre-wrap"}}>{pre.observaciones}</div>
                </div>}
              </div>}

              {/* FLETE */}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:"#f0fdf4",borderRadius:8,fontSize:12,marginBottom:12,border:"1px solid #bbf7d0"}}>
                <span style={{fontWeight:700,color:"#16a34a"}}>🚚 Flete e instalación</span>
                <span style={{fontWeight:700,color:"#16a34a"}}>SIN CARGO</span>
              </div>

              {/* ═══ TOTALES ═══ */}
              <div style={{marginTop:30,borderTop:`3px solid ${G}`,paddingTop:20}}>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <div style={{width:340}}>
                    {/* TOTAL SIN IVA */}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderBottom:`2px solid ${D}`}}>
                      <span style={{...hdr,fontSize:16,color:D}}>TOTAL (sin IVA)</span>
                      <span style={{...hdr,fontSize:20,color:D}}>{$(totalSinIva)}</span>
                    </div>

                    {/* TOTAL CON IVA */}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"16px 18px",marginTop:10,background:`linear-gradient(135deg,${D},${D2})`,borderRadius:10}}>
                      <span style={{...hdr,fontSize:16,color:"#e8c47c"}}>TOTAL (IVA inc.)</span>
                      <span style={{...hdr,fontSize:22,color:"#e8c47c"}}>{$(totalConIva)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PIE AMOBLEX */}
              <div style={{marginTop:40}}>
                <div style={{padding:16,background:"#fef9c3",borderRadius:10,border:`1px solid ${G}`,marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#92400e",marginBottom:4}}>📌 CONDICIONES</div>
                  <div style={{fontSize:10,color:"#555",lineHeight:1.6}}>
                    • Presupuesto válido al día de la fecha. Los precios pueden variar sin previo aviso.<br/>
                    • Flete e instalación sin cargo dentro de Córdoba Capital.<br/>
                    • Forma de pago a convenir.
                  </div>
                </div>
                <div style={{paddingTop:14,borderTop:`2px solid ${G}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:18,fontWeight:300,color:D,letterSpacing:4,textTransform:"uppercase"}}>Amoblex</div>
                    <div style={{fontSize:9,color:"#8a7d6b"}}>Muebles a Medida</div>
                  </div>
                  <div style={{textAlign:"right",fontSize:9,color:"#999",lineHeight:1.5}}>
                    <div>Av. Monseñor Pablo Cabrera 2870, Local 6</div>
                    <div>351-703-6419 · amoblex@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
          </>;
        })()}

        {/* ════ PLANILLA DE MATERIALES ════ */}
        {view==="planilla" && pre && (()=>{
          const plan = calcPlanilla(pre, precios);
          const cl = clientes.find(c=>c.id===pre.clienteId);
          const thS = {padding:"6px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left"};
          const tdS = {padding:"6px 10px",borderBottom:"1px solid #eee",fontSize:11};
          const tdR = {...tdS,textAlign:"right",fontWeight:700};
          // Grand total accumulator
          let grandTotal = 0;
          // Extra items helpers
          const extras = pre.itemsExtra || [];
          const addExtraItem = (sec, desc, pu) => updPre(pre.id,{itemsExtra:[...extras,{uid:uid(),seccion:sec,descripcion:desc||"",cantidad:1,unidad:sec==="Cantos"?"ml":sec==="Placas"?"placas":"u",precioUnit:pu||0}]});
          const updExtraItem = (uid_,k,v) => updPre(pre.id,{itemsExtra:extras.map(x=>x.uid===uid_?{...x,[k]:v}:x)});
          const rmExtraItem = (uid_) => updPre(pre.id,{itemsExtra:extras.filter(x=>x.uid!==uid_)});

          // Catalog options per section — Placas at $/placa (not $/m²)
          const bA={agloBlanco:5.0325,agloColor:5.0325,mdfBlanco:5.0325,mdfColor:5.0325,fibroBlanco:4.758,fibroColor:4.758,gloss:5.796};
          const secCatalog = {
            Placas:[["Placa aglo blanco (2750×1830)",Math.round(precios.placaAgloBlanco*bA.agloBlanco)],["Placa aglo color (2750×1830)",Math.round(precios.placaAgloColor*bA.agloColor)],["Placa MDF blanco (2750×1830)",Math.round(precios.placaMdfBlanco*bA.mdfBlanco)],["Placa MDF color (2750×1830)",Math.round(precios.placaMdfColor*bA.mdfColor)],["Placa Gloss (2800×2070)",Math.round(precios.placaGloss*bA.gloss)],["Fondo fibro blanco (2600×1830)",Math.round(precios.placaFibroBlanco*bA.fibroBlanco)],["Fondo fibro color (2600×1830)",Math.round(precios.placaFibroColor*bA.fibroColor)]],
            Cantos:[["Canto blanco 0.4mm",precios.cantoBlanco04],["Canto color 0.4mm",precios.cantoColor04],["Canto blanco 2mm",precios.cantoBlanco2],["Canto color 2mm",precios.cantoColor2],["Canto gloss 1mm",precios.cantoGloss1],["Canto ABS 22×0.45 c/ADH color",1160.93],["Canto ABS 22×0.45 c/ADH blanco",550.10],["Canto ABS 45×0.45 color ancho",1597.32]],
            Corte:[["Corte común",precios.corteComun],["Corte gloss",precios.corteGloss],["Pegado 0.4mm",precios.pegado04],["Pegado 2mm",precios.pegado2],["Pegado gloss",precios.pegadoGloss],["Pegado canto ancho 45mm",637.20]],
            Herrajes:[
              // Bisagras
              ["Bisagra común Clip",precios.bisagraComun],["Bisagra CS codo 0",5186.69],["Bisagra Push codo 0",1532.43],["Bisagra 165° Clip común",5197.41],["Bisagra 165° CS",precios.bisagraCierreSuave],
              // ── Corr. Telescópica Común ──
              ["── Común 30cm",precios.correderaComun30],["── Común 35cm",precios.correderaComun35],["── Común 40cm",precios.correderaComun40],["── Común 45cm",precios.correderaComun45],["── Común 50cm",precios.correderaComun],
              // ── Corr. Cierre Suave ──
              ["── CS 30cm",precios.correderaCS30],["── CS 35cm",precios.correderaCS35],["── CS 40cm",precios.correderaCS40],["── CS 45cm",precios.correderaCS45],["── CS 50cm",precios.correderaCS],["── CS 55cm",precios.correderaCS55],
              // ── Corr. Push ──
              ["── Push 30cm",precios.correderaPush30],["── Push 35cm",precios.correderaPush35],["── Push 45cm",precios.correderaPush45],["── Push 50cm",precios.correderaPush],["── Push 55cm",precios.correderaPush55],
              // ── Corr. Angosta (Grupo Euro) ──
              ["── Angosta 30cm",precios.correderaAng30],["── Angosta 35cm",precios.correderaAng35],["── Angosta 40cm",precios.correderaAng40],["── Angosta 45cm",precios.correderaAng45],["── Angosta 50cm",precios.correderaAng50],["── Angosta 55cm",precios.correderaAng55],
              // ── Matrix Box ──
              ["── Matrix Box 450",precios.matrixBox450],["── Matrix Box 500",precios.matrixBox],
              // Otros herrajes
              ["Lateral metálico",precios.lateralMet],["Set barra lateral 500",precios.setBarraLat],
              ["Soporte estante",precios.soporteEstante],["Soporte estante escuadra full",535.82],["Minifix caja 18mm",precios.minifix],["Minifix perno 34 11mm",213.84],
              ["Tornillo 16mm",precios.tornillo16],["Tornillo 32mm",precios.tornillo32],["Tornillo 48mm",precios.tornillo48],["Tornillo 60mm",precios.tornillo60],
              ["Pata plástica",precios.pataPlastica],["Clip zócalo",precios.clipZocalo],["Esquinero zócalo 100",4217.46],["Unión zócalo aluminio",4613.96],
              ["Retén expulsor Push",precios.expulsorPush],["Deslizador plástico 44×16",456.04],["Tope autoadhesivo",41.12],
              ["Pistón Hafele SKO N120 (N150)",precios.pistonSKON120],["Pistón Hafele N120",precios.pistonN100],["Pistón Hafele N100",7313.91],["Pistón Fuerza Inversa N100",precios.pistonFuerzaInv],
              ["Protector ignífugo x4",precios.protectorIgnifugo],["Pasacable PVC negro",precios.pasacablePVC],
              ["Soporte alacena c/cobertor",precios.soporteAlacena],["Tarugo espiral",203.65],["Escuadra soporte gola",precios.escuadraSoporte],
              ["Embalaje film (x placa)",15822],["Lija esponja (c/5 placas)",3848.34],
            ],
            Perfiles:[
              ["Perfil Top 20×45 (3m)",precios.perfilTop2045],["Perfil Sierra (3m)",precios.perfilSierra],
              ["Gola Sup. alum natural (3m)",precios.perfilAlumNatural],["Gola Sup. alum blanco/negro (3m)",precios.perfilAlumBlanco],
              ["Gola Med. alum natural (3m)",precios.perfilMedAlumNatural],["Gola Med. alum blanco/negro (3m)",precios.perfilMedAlumBlanco],
              ["Gola Sup. MC (3m)",precios.perfilMC],["Gola Sup. MH (3m)",precios.perfilMH],
              ["Escuadra gola",precios.escuadraGola],["Esquinero perfil gola",7293.75],
              ["Perfil Class (3m)",28593.81],
              ["Perfil sop. est. flotante (3m)",precios.perfilSopEstFlot],
              ["Zócalo aluminio 100mm (3m)",precios.zocaloAlumMl],["Zócalo aluminio 150mm (3m)",36000],
              ["Escuadra alum 20×45",precios.escuadraAlum2045],
            ],
            Otro:[["Cerradura cajón 19/22mm",2579.06],["Caño oval cromado 3m",11431],["Silicona Fischer blanca",6675.06],["Silicona Fischer transparente",12732.16]],
          };
          // Render extra rows inline (NOT as component to avoid focus loss)
          const renderExtras = (sec, cols) => {
            const items = extras.filter(it=>it.seccion===sec);
            const catOpts = (secCatalog[sec]||[]).map(o=>o[0]);
            const descSpan = Math.max(1, (cols||5) - 3);
            return items.map(it=>{
              const cost = (it.precioUnit||0)*(it.cantidad||0);
              grandTotal += cost;
              const isCustom = !catOpts.includes(it.descripcion);
              return <tr key={it.uid} style={{background:"#fef9c3"}}>
                <td colSpan={descSpan} style={tdS}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <button onClick={()=>rmExtraItem(it.uid)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:11,padding:0,fontWeight:700}}>×</button>
                    {isCustom
                      ? <input value={it.descripcion} onChange={e=>updExtraItem(it.uid,"descripcion",e.target.value)} style={{border:`1px solid ${G}33`,borderRadius:4,background:"#fff",fontSize:11,flex:1,padding:"2px 6px",fontFamily:"inherit",fontWeight:600,color:"#92400e"}} placeholder="Descripción..."/>
                      : <span style={{fontSize:11,fontWeight:600,color:"#92400e"}}>{it.descripcion}</span>
                    }
                  </div>
                </td>
                <td style={tdR}><input type="number" min={0} step="0.01" value={it.cantidad===0?"":it.cantidad} onFocus={e=>e.target.select()} onChange={e=>updExtraItem(it.uid,"cantidad",parseFloat(e.target.value)||0)} style={{border:`1px solid ${G}33`,borderRadius:4,background:"#fff",fontSize:12,width:70,textAlign:"right",padding:"3px 6px",fontWeight:700}}/></td>
                <td style={tdR}>{isCustom
                  ? <MoneyInput value={it.precioUnit||0} onChange={v=>updExtraItem(it.uid,"precioUnit",v)} style={{border:`1px solid ${G}33`,borderRadius:4,background:"#fff",fontSize:10,width:90,textAlign:"right",padding:"3px 5px"}}/>
                  : $(it.precioUnit||0)
                }</td>
                <td style={{...tdR,color:"#16a34a"}}>{$(cost)}</td>
              </tr>;
            });
          };
          const renderAddBtn = (sec, cols) => <tr><td colSpan={cols||5} style={{padding:"4px 10px"}}>
            <select style={{fontSize:10,color:G,background:"#faf8f5",border:`1px dashed ${G}`,borderRadius:5,padding:"4px 8px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,minWidth:180}} onChange={e=>{
              if(!e.target.value) return;
              if(e.target.value==="__custom__") { addExtraItem(sec,"",0); }
              else { const opt = (secCatalog[sec]||[]).find(o=>o[0]===e.target.value); if(opt) addExtraItem(sec,opt[0],opt[1]); }
              e.target.value="";
            }}>
              <option value="">+ Agregar...</option>
              {(secCatalog[sec]||[]).map(([nom,pu])=><option key={nom} value={nom}>{nom} — {$(pu)}</option>)}
              <option value="__custom__">✏️ Personalizado</option>
            </select>
          </td></tr>;
          // Dynamic herraje price lookup (handles names with color/size)
          const herrLookupP = (nom) => {
            const n = nom.toLowerCase();
            if(n.includes("bisagra") && n.includes("cierre suave")) return precios.bisagraCierreSuave;
            if(n.includes("bisagra") && n.includes("común")) return precios.bisagraComun;
            if(n.includes("matrix")) return n.includes("450")?(precios.matrixBox450||precios.matrixBox):precios.matrixBox;
            if(n.includes("lateral met")) return precios.lateralMet;
            if(n.includes("corredera")) {
              const szM = n.match(/(\d+)cm/); const sz = szM ? szM[1] : "50";
              if(n.includes(" cs ")) { return precios["correderaCS"+(sz==="50"?"":sz)]||precios.correderaCS; }
              if(n.includes("push")) { return precios["correderaPush"+(sz==="50"?"":sz)]||precios.correderaPush; }
              return precios["correderaComun"+(sz==="50"?"":sz)]||precios.correderaComun;
            }
            if(n.includes("pistón")&&n.includes("sko")) return precios.pistonSKON120;
            if(n.includes("pistón")&&n.includes("inversa")) return precios.pistonFuerzaInv;
            if(n.includes("pistón")&&n.includes("n100")) return precios.pistonN100;
            if(n.includes("pistón")&&n.includes("n120")) return precios.pistonN100;
            const sm = {"expulsor push":precios.expulsorPush,"soporte estante":precios.soporteEstante,"minifix":precios.minifix,
              "soporte alacena":precios.soporteAlacena,"tarugo":precios.tarugo,"pata plástica":precios.pataPlastica,
              "clip zócalo":precios.clipZocalo,"escuadra soporte":precios.escuadraSoporte,
              "pasacable pvc":precios.pasacablePVC,"protector ignífugo":precios.protectorIgnifugo,
              "set barra lateral":precios.setBarraLat,"zócalo aluminio":precios.zocaloAlumMl,
              "tornillo 16mm":precios.tornillo16,"tornillo 32mm":precios.tornillo32,"tornillo 48mm":precios.tornillo48,"tornillo 60mm":precios.tornillo60,
              "embalaje film":precios.embalajeFilm||15822,"lija esponja":precios.lijaEsponja||3848};
            for(const [k,v] of Object.entries(sm)) { if(n.includes(k)) return v; }
            return 0;
          };
          const herrPriceMap = {
          };
          // Gola/tirador price map
          const golaTirMap = {
            "Gola Sup. alum. blanco (3m)":precios.perfilAlumBlanco,"Gola Sup. alum. negro (3m)":precios.perfilAlumNegro,"Gola Sup. alum. natural (3m)":precios.perfilAlumNatural,
            "Gola Med. alum. blanco (3m)":precios.perfilMedAlumBlanco,"Gola Med. alum. negro (3m)":precios.perfilMedAlumNegro,"Gola Med. alum. natural (3m)":precios.perfilMedAlumNatural,
            "Gola Sup. MC (3m)":precios.perfilMC,"Gola Sup. MH (3m)":precios.perfilMH,"Gola Sup. MJ (3m)":precios.perfilMJ,
            "Gola Med. MC (3m)":precios.perfilMedMC,"Gola Med. MH (3m)":precios.perfilMedMH,"Gola Med. MJ (3m)":precios.perfilMedMJ,
            "Escuadra Gola":precios.escuadraGola,"Soporte Gola":precios.soporteGola,
            "Tirador Class 70":precios.tiradorClass70,"Tirador Class 70 negro":precios.tiradorClass70Negro,
            "Tirador Barral 96mm":precios.tiradorBarral96L,"Tirador Barral 128mm":precios.tiradorBarral128L,
            "Tirador Udine negro 192":precios.tiradorUdineNegro192,"Tirador Udine alum 192":precios.tiradorUdineAlum192,
            "Manija Barral Inox 128":precios.manijaBarralInox128,"Manija Bergamo 96":precios.manijaBergamo96,"Tirador Botón":precios.tiradorBoton,"Manija Barral Esquel 128":precios.manijaBarralEsquel128,
            "Perfil Top 20×45 (3m)":precios.perfilTop2045,"Perfil Sierra (3m)":precios.perfilSierra,
            "Perfil Inter negro (3m)":precios.perfilInterNegro,"Perfil Inter aluminio (3m)":precios.perfilInterAlum,
            "Escuadra 20×45":precios.escuadraAlum2045,"Perfil Sop. Est. Flotante":precios.perfilSopEstFlot,
          };
          const allHerrPrice = {...herrPriceMap,...golaTirMap};
          const planPdfName = "Planilla " + [cl?.nombre||"", cl?.telefono||"", pre.fecha||""].filter(Boolean).join(" - ").replace(/[\/\\:*?"<>|]/g,"_");
          return <>
            <div style={{display:"flex",gap:8,marginBottom:12}} className="no-print">
              <button onClick={()=>setView("editPre")} style={btnO}>← Volver al editor</button>
              <button onClick={()=>doPrint(printRef.current, planPdfName)} style={btnG}>📥 Descargar PDF</button>
              {planEdits[pre.id] && <button onClick={()=>setPlanEdits(p=>{const n={...p};delete n[pre.id];return n;})} style={btnO}>↺ Reset edits</button>}
            </div>
            <div ref={printRef} style={{background:"#fff",borderRadius:14,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,.08)",maxWidth:800,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:D}}>PLANILLA DE MATERIALES</div>
                <div style={{fontSize:12,color:"#8a7d6b",marginTop:4}}>Presupuesto #{pre.numero} — {cl?.nombre||""} — {pre.fecha}</div>
              </div>

              {/* ═══ PLANO 2D COCINA ═══ */}
              {pre.layoutCocina && (()=>{
                const lc = pre.layoutCocina;
                const mods = (pre.modulos||[]).map(ms=>{
                  const mod = ALL_MODS.find(m=>m.id===ms.modId);
                  return mod ? {...ms, mod, cat:mod.cat, nombre:mod.nombre, w:ms.ancho} : null;
                }).filter(Boolean);
                const bmMods = mods.filter(m=>m.cat==="bm");
                const alMods = mods.filter(m=>m.cat==="al");
                const toMods = mods.filter(m=>m.cat==="to");
                const deMods = mods.filter(m=>m.cat==="de");
                const esMods = mods.filter(m=>m.cat==="es");
                const sc = 0.07;
                const bmD = 42, alD = 26, wl = 8, gap = 5;
                const catColor = (cat,tipo)=>{
                  if(tipo?.includes("esq")) return "#fbbf24";
                  if(tipo?.includes("horno")) return "#fecaca";
                  if(tipo?.includes("caj")) return "#d4c4a8";
                  if(tipo?.includes("micro")) return "#d9f99d";
                  if(tipo?.includes("vinoteca")) return "#e9d5ff";
                  if(cat==="al") return "#c7d2fe";
                  if(cat==="to") return "#fbcfe8";
                  if(cat==="de") return "#d8b4fe";
                  if(cat==="es") return "#bfdbfe";
                  return "#e8dcc8";
                };
                const modBox = (m,x,y,w,h,vert)=>{
                  const c = catColor(m.cat, m.mod.tipo);
                  const fs = Math.min(8, Math.max(5, Math.min(w,h)/5));
                  const short = m.nombre.replace("Esquinero ","Esq ").replace("Alacena ","Al ").replace("Bajo Mesada ","BM ").replace("Cajonera ","Caj ").replace("Despensero ","De ").replace("Torre ","T ").replace("Microondas","μ").replace("Arriba Heladera","Heladera").replace("Basculante","Basc").replace(" Paño Fijo","");
                  const label = short.length>12?short.slice(0,11)+"…":short;
                  return <g key={m.uid}>
                    <rect x={x} y={y} width={w} height={h} fill={c} stroke="#1a1a2e" strokeWidth={0.8} rx={2} opacity={0.9}/>
                    {!vert ? <>
                      <text x={x+w/2} y={y+h/2-1} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fill="#1a1a2e" fontWeight={700}>{label}</text>
                      <text x={x+w/2} y={y+h/2+fs} textAnchor="middle" fontSize={fs-1.5} fill="#c9a96e" fontWeight={700}>{m.w}</text>
                    </> : <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fill="#1a1a2e" fontWeight={700} transform={`rotate(-90,${x+w/2},${y+h/2})`}>{label} {m.w}</text>}
                  </g>;
                };

                if(lc.layout==="lineal") {
                  const totalW = bmMods.reduce((s,m)=>s+m.w,0) + toMods.reduce((s,m)=>s+m.w,0) + deMods.reduce((s,m)=>s+m.w,0);
                  const svgW = totalW*sc+40;
                  const tallH = alD+gap+bmD;
                  const svgH = wl+tallH+28;
                  let xAl=16, xBm=16;
                  return <div style={{marginBottom:20,padding:16,background:"#faf8f5",borderRadius:12,border:"1px solid #e8e0d4"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8}}>🍳 Plano de Cocina — Lineal</div>
                    <div style={{overflowX:"auto",textAlign:"center"}}>
                      <svg width={svgW} height={svgH}>
                        <rect x={0} y={0} width={svgW} height={wl} fill="#9ca3af" rx={1}/>
                        <text x={svgW/2} y={wl-1.5} textAnchor="middle" fontSize={6} fill="#fff" fontWeight={600}>PARED</text>
                        {alMods.map(m=>{ const w=m.w*sc; const r=modBox(m,xAl,wl+1,w-1,alD,false); xAl+=w; return r; })}
                        {toMods.map(m=>{ const w=m.w*sc; const r=<g key={m.uid}><rect x={xAl} y={wl+1} width={w-1} height={tallH} fill="#fbcfe8" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={xAl+w/2} y={wl+tallH/2+3} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700}>🏗️ Torre {m.w}</text></g>; xAl+=w; return r; })}
                        {deMods.map(m=>{ const w=m.w*sc; const r=<g key={m.uid}><rect x={xAl} y={wl+1} width={w-1} height={tallH} fill="#d8b4fe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={xAl+w/2} y={wl+tallH/2+3} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700}>🚪 Desp {m.w}</text></g>; xAl+=w; return r; })}
                        {esMods.map(m=>{ const w=m.w*sc; const r=<g key={m.uid}><rect x={xAl} y={wl+1} width={w-1} height={tallH} fill="#bfdbfe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={xAl+w/2} y={wl+tallH/2+3} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700}>❄️ Heladera {m.w}</text></g>; xAl+=w; return r; })}
                        <line x1={16} y1={wl+alD+2} x2={16+bmMods.reduce((s,m)=>s+m.w,0)*sc} y2={wl+alD+2} stroke="#c9a96e" strokeWidth={2}/>
                        {bmMods.map(m=>{ const w=m.w*sc; const r=modBox(m,xBm,wl+alD+gap,w-1,bmD,false); xBm+=w; return r; })}
                        <text x={svgW/2} y={svgH-3} textAnchor="middle" fontSize={8} fill="#999">{(totalW/1000).toFixed(1)}m lineal</text>
                      </svg>
                    </div>
                  </div>;
                }

                if(lc.layout==="L") {
                  const esqBM = bmMods.filter(m=>m.mod.tipo.includes("esq"));
                  const restBM = bmMods.filter(m=>!m.mod.tipo.includes("esq"));
                  const esqAL = alMods.filter(m=>m.mod.tipo.includes("esq"));
                  const restAL = alMods.filter(m=>!m.mod.tipo.includes("esq"));
                  const t1mm = (lc.tramos[0]||3)*1000, t2mm = (lc.tramos[1]||2.5)*1000;
                  const esqW = esqBM[0]?.w||1000;
                  const topBM = restBM.slice(0, Math.ceil(restBM.length/2));
                  const leftBM = restBM.slice(Math.ceil(restBM.length/2));
                  const topAL = restAL.slice(0, Math.ceil(restAL.length/2));
                  const leftAL = restAL.slice(Math.ceil(restAL.length/2));
                  const cs = bmD;
                  const topW = topBM.reduce((s,m)=>s+m.w,0)*sc;
                  const leftH = leftBM.reduce((s,m)=>s+m.w,0)*sc + toMods.reduce((s,m)=>s+m.w,0)*sc + deMods.reduce((s,m)=>s+m.w,0)*sc;
                  const ox = alD+wl+12, oy = 12;
                  const svgW = ox+cs+topW+50+(toMods.length||deMods.length?50:0);
                  const svgH = oy+wl+alD+gap+cs+leftH+18;
                  const els = [];
                  // Walls
                  els.push(<rect key="wt" x={oy} y={oy} width={ox+cs+topW-oy+4} height={wl} fill="#9ca3af" rx={1}/>);
                  els.push(<rect key="wl" x={oy} y={oy} width={wl} height={wl+alD+gap+cs+leftH+4} fill="#9ca3af" rx={1}/>);
                  // Corner
                  if(esqBM[0]) els.push(modBox(esqBM[0],ox,oy+wl+alD+gap,cs-1,cs-1,false));
                  if(esqAL[0]) els.push(modBox(esqAL[0],ox,oy+wl+1,cs-1,alD,false));
                  // Top AL+BM
                  let xt=ox+cs;
                  topAL.forEach(m=>{ els.push(modBox(m,xt,oy+wl+1,m.w*sc-1,alD,false)); xt+=m.w*sc; });
                  els.push(<line key="mt" x1={ox+cs} y1={oy+wl+alD+2} x2={ox+cs+topW} y2={oy+wl+alD+2} stroke="#c9a96e" strokeWidth={2}/>);
                  let xb=ox+cs;
                  topBM.forEach(m=>{ els.push(modBox(m,xb,oy+wl+alD+gap,m.w*sc-1,bmD,false)); xb+=m.w*sc; });
                  // Left AL+BM
                  let yl=oy+wl+alD+gap+cs;
                  // Tall modules first
                  toMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={oy+wl+1} y={yl} width={alD+gap+bmD-1} height={h-1} fill="#fbcfe8" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={oy+wl+(alD+gap+bmD)/2} y={yl+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(-90,${oy+wl+(alD+gap+bmD)/2},${yl+h/2})`}>🏗️ Torre {m.w}</text></g>); yl+=h; });
                  deMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={oy+wl+1} y={yl} width={alD+gap+bmD-1} height={h-1} fill="#d8b4fe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={oy+wl+(alD+gap+bmD)/2} y={yl+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(-90,${oy+wl+(alD+gap+bmD)/2},${yl+h/2})`}>🚪 Desp {m.w}</text></g>); yl+=h; });
                  esMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={oy+wl+1} y={yl} width={alD+gap+bmD-1} height={h-1} fill="#bfdbfe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={oy+wl+(alD+gap+bmD)/2} y={yl+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(-90,${oy+wl+(alD+gap+bmD)/2},${yl+h/2})`}>❄️ Helad {m.w}</text></g>); yl+=h; });
                  const leftStartY = yl;
                  leftAL.forEach(m=>{ els.push(modBox(m,oy+wl+1,yl,alD,m.w*sc-1,true)); yl+=m.w*sc; });
                  yl = leftStartY;
                  els.push(<line key="ml" x1={oy+wl+alD+2} y1={leftStartY} x2={oy+wl+alD+2} y2={leftStartY+leftBM.reduce((s,m)=>s+m.w,0)*sc} stroke="#c9a96e" strokeWidth={2}/>);
                  leftBM.forEach(m=>{ els.push(modBox(m,oy+wl+alD+gap,yl,bmD,m.w*sc-1,true)); yl+=m.w*sc; });
                  els.push(<text key="info" x={svgW/2} y={svgH-2} textAnchor="middle" fontSize={7} fill="#999">En L: {lc.tramos[0]}m × {lc.tramos[1]}m</text>);
                  return <div style={{marginBottom:20,padding:16,background:"#faf8f5",borderRadius:12,border:"1px solid #e8e0d4"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8}}>🍳 Plano de Cocina — En L</div>
                    <div style={{overflowX:"auto",textAlign:"center"}}><svg width={svgW} height={svgH}>{els}</svg></div>
                  </div>;
                }

                if(lc.layout==="U") {
                  const esqBMs = bmMods.filter(m=>m.mod.tipo.includes("esq"));
                  const restBM = bmMods.filter(m=>!m.mod.tipo.includes("esq"));
                  const esqALs = alMods.filter(m=>m.mod.tipo.includes("esq"));
                  const restAL = alMods.filter(m=>!m.mod.tipo.includes("esq"));
                  const cs = bmD;
                  const third = Math.ceil(restBM.length/3);
                  const topBM = restBM.slice(0, third);
                  const leftBM = restBM.slice(third, third*2);
                  const rightBM = restBM.slice(third*2);
                  const thirdA = Math.ceil(restAL.length/3);
                  const topAL = restAL.slice(0, thirdA);
                  const leftAL = restAL.slice(thirdA, thirdA*2);
                  const rightAL = restAL.slice(thirdA*2);
                  const topW = topBM.reduce((s,m)=>s+m.w,0)*sc;
                  const sideH = Math.max(leftBM.reduce((s,m)=>s+m.w,0), rightBM.reduce((s,m)=>s+m.w,0)+toMods.reduce((s,m)=>s+m.w,0)+deMods.reduce((s,m)=>s+m.w,0))*sc;
                  const ox=alD+wl+12, oy=12;
                  const svgW = ox+cs+topW+cs+alD+wl+12;
                  const svgH = oy+wl+alD+gap+cs+Math.max(sideH,60)+18;
                  const rightOx = ox+cs+topW;
                  const els = [];
                  els.push(<rect key="wt" x={oy} y={oy} width={svgW-oy*2} height={wl} fill="#9ca3af" rx={1}/>);
                  els.push(<rect key="wl" x={oy} y={oy} width={wl} height={wl+alD+gap+cs+sideH+4} fill="#9ca3af" rx={1}/>);
                  els.push(<rect key="wr" x={svgW-oy-wl} y={oy} width={wl} height={wl+alD+gap+cs+sideH+4} fill="#9ca3af" rx={1}/>);
                  // Corner AL L+R
                  if(esqALs[0]) els.push(modBox(esqALs[0],ox,oy+wl+1,cs-1,alD,false));
                  if(esqALs[1]) els.push(modBox(esqALs[1],rightOx,oy+wl+1,cs-1,alD,false));
                  // Corner BM L+R
                  if(esqBMs[0]) els.push(modBox(esqBMs[0],ox,oy+wl+alD+gap,cs-1,cs-1,false));
                  if(esqBMs[1]) els.push(modBox(esqBMs[1],rightOx,oy+wl+alD+gap,cs-1,cs-1,false));
                  // Top
                  let xt=ox+cs;
                  topAL.forEach(m=>{ els.push(modBox(m,xt,oy+wl+1,m.w*sc-1,alD,false)); xt+=m.w*sc; });
                  els.push(<line key="mt" x1={ox+cs} y1={oy+wl+alD+2} x2={rightOx} y2={oy+wl+alD+2} stroke="#c9a96e" strokeWidth={2}/>);
                  let xb=ox+cs;
                  topBM.forEach(m=>{ els.push(modBox(m,xb,oy+wl+alD+gap,m.w*sc-1,bmD,false)); xb+=m.w*sc; });
                  // Left side
                  const sY=oy+wl+alD+gap+cs; let ylA=sY, ylB=sY;
                  leftAL.forEach(m=>{ els.push(modBox(m,oy+wl+1,ylA,alD,m.w*sc-1,true)); ylA+=m.w*sc; });
                  els.push(<line key="ml" x1={oy+wl+alD+2} y1={sY} x2={oy+wl+alD+2} y2={sY+leftBM.reduce((s,m)=>s+m.w,0)*sc} stroke="#c9a96e" strokeWidth={2}/>);
                  leftBM.forEach(m=>{ els.push(modBox(m,oy+wl+alD+gap,ylB,bmD,m.w*sc-1,true)); ylB+=m.w*sc; });
                  // Right side: tall then regular
                  let yrA=sY, yrB=sY;
                  toMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={svgW-oy-wl-alD-gap-bmD+1} y={yrB} width={alD+gap+bmD-2} height={h-1} fill="#fbcfe8" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={svgW-oy-wl-(alD+gap+bmD)/2} y={yrB+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(90,${svgW-oy-wl-(alD+gap+bmD)/2},${yrB+h/2})`}>🏗️ Torre {m.w}</text></g>); yrB+=h; yrA+=h; });
                  deMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={svgW-oy-wl-alD-gap-bmD+1} y={yrB} width={alD+gap+bmD-2} height={h-1} fill="#d8b4fe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={svgW-oy-wl-(alD+gap+bmD)/2} y={yrB+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(90,${svgW-oy-wl-(alD+gap+bmD)/2},${yrB+h/2})`}>🚪 Desp {m.w}</text></g>); yrB+=h; yrA+=h; });
                  esMods.forEach(m=>{ const h=m.w*sc; els.push(<g key={m.uid}><rect x={svgW-oy-wl-alD-gap-bmD+1} y={yrB} width={alD+gap+bmD-2} height={h-1} fill="#bfdbfe" stroke="#1a1a2e" strokeWidth={1} rx={3} strokeDasharray="3,2"/><text x={svgW-oy-wl-(alD+gap+bmD)/2} y={yrB+h/2} textAnchor="middle" fontSize={7} fill="#1a1a2e" fontWeight={700} transform={`rotate(90,${svgW-oy-wl-(alD+gap+bmD)/2},${yrB+h/2})`}>❄️ Helad {m.w}</text></g>); yrB+=h; yrA+=h; });
                  rightAL.forEach(m=>{ els.push(modBox(m,svgW-oy-wl-alD+1,yrA,alD-2,m.w*sc-1,true)); yrA+=m.w*sc; });
                  els.push(<line key="mr" x1={svgW-oy-wl-alD-2} y1={yrB>sY?yrB:sY} x2={svgW-oy-wl-alD-2} y2={sY+sideH} stroke="#c9a96e" strokeWidth={2}/>);
                  rightBM.forEach(m=>{ els.push(modBox(m,rightOx+cs-bmD,yrB,bmD,m.w*sc-1,true)); yrB+=m.w*sc; });
                  els.push(<text key="c" x={svgW/2} y={sY+sideH/2} textAnchor="middle" fontSize={14} fill="#e5e7eb" fontWeight={900}>COCINA</text>);
                  els.push(<text key="info" x={svgW/2} y={svgH-2} textAnchor="middle" fontSize={7} fill="#999">En U: {lc.tramos.map(t=>t+"m").join(" × ")}</text>);
                  return <div style={{marginBottom:20,padding:16,background:"#faf8f5",borderRadius:12,border:"1px solid #e8e0d4"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8}}>🍳 Plano de Cocina — En U</div>
                    <div style={{overflowX:"auto",textAlign:"center"}}><svg width={svgW} height={svgH}>{els}</svg></div>
                  </div>;
                }
                return null;
              })()}

              {/* PLACAS — CNC Optimizado */}
              {(()=>{
                const pe = planEdits[pre.id] || {};
                const peB = pe.boards || {};
                return <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:4,paddingBottom:4,borderBottom:`2px solid ${G}`}}>📦 Placas <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>(guillotina CNC — kerf {CNC_KERF}mm, borde {CNC_TRIM}mm, veta color ↔ 2750mm, 12 estrategias)</span></div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr><th style={thS}>Tipo</th><th style={{...thS,textAlign:"right"}}>m²</th><th style={{...thS,textAlign:"right"}}>Placas</th><th style={{...thS,textAlign:"right"}}>$/placa</th><th style={{...thS,textAlign:"right",color:G}}>Costo</th></tr></thead>
                  <tbody>
                    {Object.entries(plan.boards).map(([nom,b],i)=>{
                      const eName = peB[nom]?.nombre ?? nom;
                      const ePlacas = peB[nom]?.placas ?? b.placas;
                      const costo = ePlacas * b.precioUnit;
                      grandTotal += costo;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={tdS}><input value={eName} onChange={e=>updPlanEdit(pre.id,"boards",nom,"nombre",e.target.value)} style={{border:"none",background:"transparent",fontSize:11,width:"100%",padding:0,fontFamily:"inherit"}}/></td>
                        <td style={tdR}>{b.m2} m²</td>
                        <td style={{...tdR,color:G,fontSize:14}}><input type="number" min={0} value={ePlacas} onChange={e=>updPlanEdit(pre.id,"boards",nom,"placas",parseInt(e.target.value)||0)} style={{border:`1px solid ${G}33`,borderRadius:4,background:"#fef9c3",fontSize:12,width:50,textAlign:"right",padding:"2px 4px",fontWeight:700}}/></td>
                        <td style={tdR}>{$(b.precioUnit)}</td><td style={{...tdR,color:"#16a34a"}}>{$(costo)}</td>
                      </tr>;
                    })}
                    {renderExtras("Placas",5)}
                    {renderAddBtn("Placas",5)}
                  </tbody>
                </table>
                {Object.keys(plan.boards).length===0 && extras.filter(e=>e.seccion==="Placas").length===0 && <div style={{fontSize:11,color:"#999",padding:8}}>Sin módulos</div>}

                {/* CNC Board layouts visual */}
                {Object.entries(plan.boards).map(([nom,b])=>{
                  if(!b.cnc) return null;
                  return <div key={nom} style={{marginTop:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:D,marginBottom:6}}>{nom} — {b.cnc.totalBoards} placa{b.cnc.totalBoards>1?"s":""}</div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {b.cnc.boards.map((board,bi)=>{
                        const bW = nom.includes("Gloss")?2800:nom.includes("fibro")?2600:2750;
                        const bH = nom.includes("Gloss")?2070:1830;
                        const scale = 180/Math.max(bW,bH);
                        const isColorBoard = nom.includes("color")||nom.includes("Color");
                        const colors = ["#e0f2fe","#fef3c7","#dcfce7","#fce7f3","#f3e8ff","#fff7ed","#ecfdf5","#fdf2f8"];
                        const hasGrain = board.pieces.some(p=>p.grainLock);
                        return <div key={bi} style={{display:"inline-block"}}>
                          <div style={{fontSize:9,textAlign:"center",color:"#8a7d6b",marginBottom:2}}>Placa {bi+1} — {board.efficiency}% uso{hasGrain?" 🪵 c/veta":""}</div>
                          <div style={{position:"relative",width:bW*scale,height:bH*scale,border:"2px solid "+D,borderRadius:3,background:isColorBoard?"repeating-linear-gradient(90deg,#f9f7f4,#f9f7f4 4px,#f0ebe3 4px,#f0ebe3 5px)":"#f9f7f4",overflow:"hidden"}}>
                            {isColorBoard && <div style={{position:"absolute",bottom:2,left:4,fontSize:7,color:"#8a7d6b",zIndex:2,fontWeight:700}}>↔ VETA ({bW}mm)</div>}
                            {board.pieces.map((p,pi)=>(
                              <div key={pi} title={`${p.nombre} (${p.modulo}) ${p.w}×${p.h}mm${p.rotated?" ↻":""}${p.grainLock?" [VETA]":""}`}
                                style={{position:"absolute",left:p.x*scale+CNC_TRIM*scale,top:p.y*scale+CNC_TRIM*scale,
                                  width:p.w*scale-1,height:p.h*scale-1,
                                  background:p.grainLock?"#fbbf24":colors[pi%colors.length],
                                  border:p.grainLock?"2px solid #92400e":"1px solid rgba(0,0,0,.15)",
                                  fontSize:7,overflow:"hidden",lineHeight:"1.1",padding:1,boxSizing:"border-box"}}>
                                <div style={{fontWeight:600}}>{p.nombre}{p.grainLock?"🪵":""}</div>
                                <div>{p.w}×{p.h}</div>
                              </div>
                            ))}
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>;
                })}
              </div>;
              })()}

              {/* CANTOS */}
              {(()=>{
                const pe = planEdits[pre.id] || {};
                const peC = pe.cantos || {};
                return <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${G}`}}>📏 Cantos <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>(+30% despunte)</span></div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr><th style={thS}>Tipo</th><th style={{...thS,textAlign:"right"}}>ML real</th><th style={{...thS,textAlign:"center"}}>+30%</th><th style={{...thS,textAlign:"right"}}>ML total</th><th style={{...thS,textAlign:"right"}}>$/ml</th><th style={{...thS,textAlign:"right",color:G}}>Costo</th></tr></thead>
                  <tbody>
                    {Object.entries(plan.cantos).map(([nom,c],i)=>{
                      const eName = peC[nom]?.nombre ?? nom;
                      const eMl = peC[nom]?.ml ?? c.ml;
                      const costo = eMl * c.precioMl;
                      grandTotal += costo;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={tdS}><input value={eName} onChange={e=>updPlanEdit(pre.id,"cantos",nom,"nombre",e.target.value)} style={{border:"none",background:"transparent",fontSize:11,width:"100%",padding:0,fontFamily:"inherit"}}/></td>
                        <td style={tdR}>{c.mlBase}</td>
                        <td style={{...tdS,textAlign:"center",fontSize:10,color:"#92400e"}}>+{c.mlExtra}</td>
                        <td style={{...tdR,fontWeight:700,color:G}}><input type="number" step="0.01" min={0} value={eMl} onChange={e=>updPlanEdit(pre.id,"cantos",nom,"ml",parseFloat(e.target.value)||0)} style={{border:`1px solid ${G}33`,borderRadius:4,background:"#fef9c3",fontSize:11,width:65,textAlign:"right",padding:"2px 4px",fontWeight:700}}/></td>
                        <td style={tdR}>{$(c.precioMl)}</td>
                        <td style={{...tdR,color:"#16a34a"}}>{$(costo)}</td>
                      </tr>;
                    })}
                    {renderExtras("Cantos",6)}
                    {renderAddBtn("Cantos",6)}
                  </tbody>
                </table>
                {Object.keys(plan.cantos).length===0 && extras.filter(e=>e.seccion==="Cantos").length===0 && <div style={{fontSize:11,color:"#999",padding:8}}>Sin cantos</div>}
              </div>;
              })()}

              {/* CORTES Y PEGADO */}
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${G}`}}>✂️ Cortes <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>(+25%)</span> y Pegado</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4}}>Cortes</div>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr><th style={{...thS,fontSize:9}}>Tipo</th><th style={{...thS,textAlign:"right",fontSize:9}}>Cant</th><th style={{...thS,textAlign:"center",fontSize:9}}>+25%</th><th style={{...thS,textAlign:"right",fontSize:9}}>Total</th><th style={{...thS,textAlign:"right",fontSize:9}}>$/u</th><th style={{...thS,textAlign:"right",fontSize:9,color:G}}>Costo</th></tr></thead>
                      <tbody>
                        {plan.cortes.comun>0 && (()=>{const base=plan.cortes.comun;const extra=Math.ceil(base*0.25);const tot=base+extra;const c=tot*precios.corteComun;grandTotal+=c;return <tr><td style={tdS}>Corte común</td><td style={tdR}>{base}</td><td style={{...tdS,textAlign:"center",fontSize:10,color:"#92400e"}}>+{extra}</td><td style={{...tdR,fontWeight:700}}>{tot}</td><td style={tdR}>{$(precios.corteComun)}</td><td style={{...tdR,color:"#16a34a"}}>{$(c)}</td></tr>;})()}
                        {plan.cortes.gloss>0 && (()=>{const base=plan.cortes.gloss;const extra=Math.ceil(base*0.25);const tot=base+extra;const c=tot*precios.corteGloss;grandTotal+=c;return <tr><td style={tdS}>Corte gloss</td><td style={tdR}>{base}</td><td style={{...tdS,textAlign:"center",fontSize:10,color:"#92400e"}}>+{extra}</td><td style={{...tdR,fontWeight:700}}>{tot}</td><td style={tdR}>{$(precios.corteGloss)}</td><td style={{...tdR,color:"#16a34a"}}>{$(c)}</td></tr>;})()}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4}}>Pegado <span style={{fontWeight:400,fontSize:9,color:"#a09880"}}>(auto-incluye cantos extras)</span></div>
                    {(()=>{
                      // Sum extra cantos ML into pegado by type
                      const extraCantos = extras.filter(e=>e.seccion==="Cantos");
                      let ep04=0, ep2=0, epGl=0;
                      extraCantos.forEach(ec=>{
                        const d = (ec.descripcion||"").toLowerCase();
                        const ml = ec.cantidad||0;
                        if(d.includes("gloss")) epGl += ml;
                        else if(d.includes("2mm") || d.includes("2 mm") || d.includes("blanco 2") || d.includes("color 2")) ep2 += ml;
                        else ep04 += ml;
                      });
                      const tp04 = plan.pegado.p04 + ep04;
                      const tp2 = plan.pegado.p2 + ep2;
                      const tpGl = plan.pegado.pGloss + epGl;
                      return <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr><th style={{...thS,fontSize:9}}>Tipo</th><th style={{...thS,textAlign:"right",fontSize:9}}>ML</th><th style={{...thS,textAlign:"right",fontSize:9}}>$/ml</th><th style={{...thS,textAlign:"right",fontSize:9,color:G}}>Costo</th></tr></thead>
                      <tbody>
                        {tp04>0 && (()=>{const c=tp04*precios.pegado04;grandTotal+=c;return <tr><td style={tdS}>Pegado 0.4mm{ep04>0?<span style={{fontSize:8,color:"#92400e"}}> (+{ep04.toFixed(1)} extra)</span>:""}</td><td style={tdR}>{tp04.toFixed(2)}</td><td style={tdR}>{$(precios.pegado04)}</td><td style={{...tdR,color:"#16a34a"}}>{$(c)}</td></tr>;})()}
                        {tp2>0 && (()=>{const c=tp2*precios.pegado2;grandTotal+=c;return <tr><td style={tdS}>Pegado 2mm{ep2>0?<span style={{fontSize:8,color:"#92400e"}}> (+{ep2.toFixed(1)} extra)</span>:""}</td><td style={tdR}>{tp2.toFixed(2)}</td><td style={tdR}>{$(precios.pegado2)}</td><td style={{...tdR,color:"#16a34a"}}>{$(c)}</td></tr>;})()}
                        {tpGl>0 && (()=>{const c=tpGl*precios.pegadoGloss;grandTotal+=c;return <tr><td style={tdS}>Pegado gloss{epGl>0?<span style={{fontSize:8,color:"#92400e"}}> (+{epGl.toFixed(1)} extra)</span>:""}</td><td style={tdR}>{tpGl.toFixed(2)}</td><td style={tdR}>{$(precios.pegadoGloss)}</td><td style={{...tdR,color:"#16a34a"}}>{$(c)}</td></tr>;})()}
                      </tbody>
                    </table>;
                    })()}
                  </div>
                </div>
                {/* Extra items for Corte/Pegado */}
                {extras.filter(e=>e.seccion==="Corte").length > 0 && <table style={{width:"100%",borderCollapse:"collapse",marginTop:8}}>
                  <tbody>{renderExtras("Corte",4)}</tbody>
                </table>}
                <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{renderAddBtn("Corte",4)}</tbody></table>
              </div>

              {/* HERRAJES */}
              <div style={{marginBottom:10}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${G}`}}>🔩 Herrajes</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr><th style={thS}>Ítem</th><th style={{...thS,textAlign:"right"}}>Cant</th><th style={{...thS,textAlign:"right"}}>$/u</th><th style={{...thS,textAlign:"right",color:G}}>Costo</th></tr></thead>
                  <tbody>
                    {Object.entries(plan.herrajes).sort((a,b)=>a[0].localeCompare(b[0])).map(([nom,cant],i)=>{
                      const tb = (plan.tornilloBoxes||{})[nom];
                      if(tb) {
                        // Tornillo: show box info
                        grandTotal += tb.costoTotal;
                        return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                          <td style={tdS}>
                            {nom} <span style={{fontSize:9,color:"#8a7d6b"}}>({cant}u)</span>
                            <div style={{fontSize:8,color:"#b45309",marginTop:2}}>
                              📦 {tb.cajas.map(c=>`${c.cant} ${c.label}`).join(" + ")}
                            </div>
                          </td>
                          <td style={tdR}>{tb.cajas.map(c=>c.cant).reduce((a,b_)=>a+b_,0)} cajas</td>
                          <td style={tdR}>{tb.cajas.map(c=>`${$(c.p)}`).join(" / ")}</td>
                          <td style={{...tdR,color:"#16a34a"}}>{$(tb.costoTotal)}</td>
                        </tr>;
                      }
                      const pu = allHerrPrice[nom] || herrLookupP(nom) || 0;
                      const cost = pu * cant;
                      grandTotal += cost;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={tdS}>{nom}</td><td style={tdR}>{typeof cant==="number"&&cant%1!==0?cant.toFixed(2):cant}</td>
                        <td style={tdR}>{pu?$(pu):"—"}</td><td style={{...tdR,color:"#16a34a"}}>{$(cost)}</td>
                      </tr>;
                    })}
                    {renderExtras("Herrajes",4)}
                    {renderAddBtn("Herrajes",4)}
                  </tbody>
                </table>
                {Object.keys(plan.herrajes).length===0 && extras.filter(e=>e.seccion==="Herrajes").length===0 && <div style={{fontSize:11,color:"#999",padding:8}}>Sin herrajes</div>}
              </div>

              {/* VIDRIO - BAR CUTTING DESPIECE */}
              {plan.vidrioBarras && Object.keys(plan.vidrioBarras).length > 0 && <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:D,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${G}`}}>🪟 Despiece Perfiles <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>(barras 3000mm, sierra {BAR_KERF}mm — optimizado FFD)</span></div>
                {Object.entries(plan.vidrioBarras).map(([perfNom, result])=>(
                  <div key={perfNom} style={{marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:6}}>{perfNom}: {result.totalBars} barra{result.totalBars!==1?"s":""} <span style={{fontWeight:400,fontSize:10,color:"#8a7d6b"}}>({result.totalUsed}mm útil + {result.totalKerf}mm sierra + {result.waste}mm sobrante)</span></div>
                    {result.bars.map((bar, bi)=>{
                      const used = bar.pieces.reduce((s,p)=>s+p.len,0);
                      const kerfs = Math.max(0, bar.pieces.length-1)*BAR_KERF;
                      const eff = ((used+kerfs)/BAR_LEN*100).toFixed(1);
                      const colors = ["#93c5fd","#86efac","#fcd34d","#fca5a5","#c4b5fd","#f9a8d4","#a5f3fc","#fdba74"];
                      return <div key={bi} style={{marginBottom:8}}>
                        <div style={{fontSize:10,fontWeight:600,color:"#6b7280",marginBottom:2}}>Barra {bi+1} — {eff}% uso</div>
                        <div style={{position:"relative",height:28,background:"#f3f1ed",borderRadius:4,overflow:"hidden",border:"1px solid #d5cfc5"}}>
                          {(()=>{
                            let x=0;
                            return bar.pieces.map((p,pi)=>{
                              const w = p.len/BAR_LEN*100;
                              const kw = pi<bar.pieces.length-1 ? BAR_KERF/BAR_LEN*100 : 0;
                              const left = x;
                              x += w + kw;
                              return <React.Fragment key={pi}>
                                <div style={{position:"absolute",left:left+"%",width:w+"%",height:"100%",background:colors[pi%colors.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#1f2937",overflow:"hidden",whiteSpace:"nowrap",borderRight:"none"}}>
                                  {p.len}mm
                                </div>
                                {kw>0 && <div style={{position:"absolute",left:(left+w)+"%",width:kw+"%",height:"100%",background:"#dc2626"}} title="Sierra 4mm"/>}
                              </React.Fragment>;
                            });
                          })()}
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:2}}>
                          {bar.pieces.map((p,pi)=><span key={pi} style={{fontSize:8,color:"#6b7280"}}>{p.label}</span>)}
                        </div>
                      </div>;
                    })}
                  </div>
                ))}
              </div>}

              {/* EXTRAS: Perfiles */}
              {extras.filter(e=>e.seccion==="Perfiles").length > 0 && <div style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:4}}>Perfiles (extras)</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{renderExtras("Perfiles",4)}</tbody></table>
              </div>}
              <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{renderAddBtn("Perfiles",4)}</tbody></table>

              {/* EXTRAS: Otro */}
              {extras.filter(e=>e.seccion==="Otro").length > 0 && <div style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:4}}>Otros</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{renderExtras("Otro",4)}</tbody></table>
              </div>}
              <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{renderAddBtn("Otro",4)}</tbody></table>

              {/* TOTAL GENERAL */}
              <div style={{marginTop:20,padding:16,background:`linear-gradient(135deg,${D},${D2})`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#fff"}}>COSTO TOTAL MATERIALES</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:900,color:G}}>{$(grandTotal)}</span>
              </div>
            </div>
          </>;
        })()}

        {/* ════ CUENTAS CORRIENTES ════ */}
        {view==="cuentas" && isAdmin && (()=>{
          const fechaPago = (fi)=>{
            if(!fi) return "—";
            const d=new Date(fi+"T12:00:00");d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);
          };
          // Build per-client summary
          const cuentas = clientes.map(cli=>{
            const cliPres = presupuestos.filter(p=>p.clienteId===cli.id);
            const aprobados = cliPres.filter(p=>p.estado==="Aprobado");
            if(aprobados.length===0) return null;
            const totalDeuda = aprobados.reduce((s,p)=>s+calcPresupTotal(p,precios,accesorios).total,0);
            const cliPagos = pagos.filter(p=>p.clienteId===cli.id);
            const pagosPos = cliPagos.filter(p=>p.monto>0);
            const ajustesIPC = cliPagos.filter(p=>p.monto<0);
            const totalPagado = pagosPos.reduce((s,p)=>s+p.monto,0);
            const totalAjustes = ajustesIPC.reduce((s,p)=>s+Math.abs(p.monto),0);
            const saldo = totalDeuda + totalAjustes - totalPagado;
            // Fecha instalación más próxima
            const fechasInst = aprobados.map(p=>p.fechaInstalacion).filter(Boolean).sort();
            const proxInst = fechasInst.length>0 ? fechasInst[0] : null;
            const fp = fechaPago(proxInst);
            // Days until payment
            let diasPago = null;
            if(fp && fp!=="—") {
              const hoy = new Date(); hoy.setHours(0,0,0,0);
              const fpDate = new Date(fp+"T00:00:00");
              diasPago = Math.ceil((fpDate - hoy) / (1000*60*60*24));
            }
            return {cli, aprobados, saldo, totalDeuda, totalPagado, totalAjustes, proxInst, fp, diasPago, nPagos:cliPagos.length};
          }).filter(Boolean);

          const conSaldo = cuentas.filter(c=>c.saldo>0);
          const sinSaldo = cuentas.filter(c=>c.saldo<=0);
          const totalSaldos = conSaldo.reduce((s,c)=>s+c.saldo,0);
          const totalCobrado = cuentas.reduce((s,c)=>s+c.totalPagado,0);

          const thS={padding:"8px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left"};
          const tdS={padding:"7px 10px",borderBottom:"1px solid #eee",fontSize:11};
          const tdR={...tdS,textAlign:"right",fontWeight:700};

          return <>
            <Sec icon="💳" title="Cuentas Corrientes"/>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{...card,textAlign:"center",padding:14,background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",border:"none"}}>
                <div style={{fontSize:10,color:"#a09880"}}>Clientes con saldo</div>
                <div style={{fontSize:28,fontWeight:900,color:"#f87171"}}>{conSaldo.length}</div>
              </div>
              <div style={{...card,textAlign:"center",padding:14,background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",border:"none"}}>
                <div style={{fontSize:10,color:"#a09880"}}>Total a cobrar</div>
                <div style={{fontSize:18,fontWeight:900,color:"#e8c47c"}}>{$(totalSaldos)}</div>
              </div>
              <div style={{...card,textAlign:"center",padding:14,background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",border:"none"}}>
                <div style={{fontSize:10,color:"#a09880"}}>Total cobrado</div>
                <div style={{fontSize:18,fontWeight:900,color:"#7dd3a0"}}>{$(totalCobrado)}</div>
              </div>
              <div style={{...card,textAlign:"center",padding:14,background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",border:"none"}}>
                <div style={{fontSize:10,color:"#a09880"}}>Al día</div>
                <div style={{fontSize:28,fontWeight:900,color:"#7dd3a0"}}>{sinSaldo.length}</div>
              </div>
            </div>

            {/* Pending balances table */}
            {conSaldo.length>0 && <>
              <Sec icon="🔴" title="Saldos Pendientes"/>
              <div style={card}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    <th style={thS}>Cliente</th>
                    <th style={{...thS,textAlign:"right"}}>Deuda</th>
                    <th style={{...thS,textAlign:"right",color:"#7dd3a0"}}>Pagado</th>
                    <th style={{...thS,textAlign:"right",color:"#f87171"}}>Saldo</th>
                    <th style={{...thS,textAlign:"center"}}>Instalación</th>
                    <th style={{...thS,textAlign:"center"}}>Fecha Pago</th>
                    <th style={{...thS,textAlign:"center"}}>Días</th>
                  </tr></thead>
                  <tbody>{conSaldo.sort((a,b)=>{
                    if(a.diasPago===null && b.diasPago===null) return 0;
                    if(a.diasPago===null) return 1;
                    if(b.diasPago===null) return -1;
                    return a.diasPago - b.diasPago;
                  }).map((c,i)=>{
                    const urgente = c.diasPago!==null && c.diasPago<=3;
                    const vencido = c.diasPago!==null && c.diasPago<0;
                    return <tr key={i} style={{background:vencido?"#fef2f2":urgente?"#fffbeb":i%2?"#fafaf8":"#fff",cursor:"pointer"}} onClick={()=>goCli(c.cli.id)}>
                      <td style={{...tdS,fontWeight:700,color:D}}>
                        {c.cli.nombre||"Sin nombre"}
                        <div style={{fontSize:9,color:"#8a7d6b",fontWeight:400}}>{c.aprobados.length} presup. · {c.nPagos} pagos</div>
                      </td>
                      <td style={tdR}>{$(c.totalDeuda)}{c.totalAjustes>0?<span style={{fontSize:9,color:"#dc2626"}}> +{$(c.totalAjustes)}</span>:""}</td>
                      <td style={{...tdR,color:"#16a34a"}}>{$(c.totalPagado)}</td>
                      <td style={{...tdR,color:"#dc2626",fontSize:14}}>{$(c.saldo)}</td>
                      <td style={{...tdS,textAlign:"center"}}>{c.proxInst||<span style={{color:"#d5cfc5"}}>sin fecha</span>}</td>
                      <td style={{...tdS,textAlign:"center",fontWeight:600,color:vencido?"#dc2626":urgente?"#b45309":"inherit"}}>{c.fp}</td>
                      <td style={{...tdS,textAlign:"center"}}>
                        {c.diasPago===null ? <span style={{color:"#d5cfc5"}}>—</span> :
                         vencido ? <span style={{background:"#dc2626",color:"#fff",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700}}>Vencido ({Math.abs(c.diasPago)}d)</span> :
                         urgente ? <span style={{background:"#f59e0b",color:"#fff",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700}}>{c.diasPago}d</span> :
                         <span style={{fontSize:11}}>{c.diasPago}d</span>}
                      </td>
                    </tr>;
                  })}</tbody>
                  <tfoot><tr style={{background:"#f5f0e8"}}>
                    <td style={{...tdS,fontWeight:900,color:D}}>TOTAL</td>
                    <td style={tdR}>{$(conSaldo.reduce((s,c)=>s+c.totalDeuda+c.totalAjustes,0))}</td>
                    <td style={{...tdR,color:"#16a34a"}}>{$(conSaldo.reduce((s,c)=>s+c.totalPagado,0))}</td>
                    <td style={{...tdR,color:"#dc2626",fontSize:14}}>{$(totalSaldos)}</td>
                    <td colSpan={3}></td>
                  </tr></tfoot>
                </table>
              </div>
            </>}

            {/* Paid in full */}
            {sinSaldo.length>0 && <>
              <Sec icon="✅" title="Pagados / Al Día"/>
              <div style={card}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    <th style={thS}>Cliente</th>
                    <th style={{...thS,textAlign:"right"}}>Total</th>
                    <th style={{...thS,textAlign:"right",color:"#7dd3a0"}}>Pagado</th>
                    <th style={{...thS,textAlign:"center"}}>Estado</th>
                  </tr></thead>
                  <tbody>{sinSaldo.map((c,i)=>(
                    <tr key={i} style={{background:i%2?"#fafaf8":"#fff",cursor:"pointer"}} onClick={()=>goCli(c.cli.id)}>
                      <td style={{...tdS,fontWeight:600}}>{c.cli.nombre}</td>
                      <td style={tdR}>{$(c.totalDeuda)}</td>
                      <td style={{...tdR,color:"#16a34a"}}>{$(c.totalPagado)}</td>
                      <td style={{...tdS,textAlign:"center"}}><span style={{background:"#dcfce7",color:"#16a34a",padding:"3px 10px",borderRadius:10,fontSize:10,fontWeight:700}}>✅ Al día</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>}

            {cuentas.length===0 && <div style={{...card,textAlign:"center",color:"#8a7d6b",fontSize:13,padding:30}}>No hay presupuestos aprobados todavía.</div>}
          </>;
        })()}

        {/* ════ PRECIOS ════ */}
        {view==="precios" && <>
          <Sec icon="💰" title="Precios Base"/>

          {/* Backup bar */}
          <div style={{...card,background:"linear-gradient(135deg,#1a1a2e,#2d2d44)",color:"#fff",padding:14,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#e8c47c"}}>Copia de Seguridad</div>
                {preciosUpd && <div style={{fontSize:10,color:"#a09880",marginTop:2}}>Precios actualizados: {preciosUpd}</div>}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button onClick={doBackup} style={{padding:"6px 14px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#c9a96e,#e8c47c)",color:"#1a1a2e",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  📥 Descargar Backup
                </button>
                <button onClick={()=>fileRef.current?.click()} style={{padding:"6px 14px",borderRadius:7,border:"1.5px solid #c9a96e",background:"transparent",color:"#e8c47c",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  📤 Restaurar desde archivo
                </button>
                <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={doRestore}/>
                <button onClick={doBackupStorage} style={{padding:"6px 14px",borderRadius:7,border:"1.5px solid #7dd3a0",background:"transparent",color:"#7dd3a0",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  💾 Guardar en Storage
                </button>
                <button onClick={doRestoreStorage} style={{padding:"6px 14px",borderRadius:7,border:"1.5px solid #93c5fd",background:"transparent",color:"#93c5fd",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  🔄 Restaurar de Storage
                </button>
              </div>
            </div>
            {bkMsg && <div style={{marginTop:8,padding:"6px 12px",borderRadius:6,background:bkMsg.includes("Error")?"#fee2e2":"#dcfce7",color:bkMsg.includes("Error")?"#dc2626":"#16a34a",fontSize:12,fontWeight:600}}>{bkMsg}</div>}

            {/* Historial */}
            {backups.length > 0 && <>
              <button onClick={()=>setShowBackups(!showBackups)} style={{marginTop:8,background:"transparent",border:"none",color:"#a09880",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>
                {showBackups?"Ocultar":"Ver"} historial ({backups.length})
              </button>
              {showBackups && <div style={{marginTop:6,maxHeight:150,overflowY:"auto"}}>
                {backups.map(b=>(
                  <div key={b.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:10}}>
                    <span style={{color:"#e8c47c"}}>{b.fecha}</span>
                    <span style={{color:"#a09880"}}>{b.nClientes} cli / {b.nPresup} pres{b.tipo===" storage"?" 💾":""}</span>
                  </div>
                ))}
              </div>}
            </>}
          </div>


          {/* CSV Export/Import */}
          <div style={{...card,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:D}}>Exportar / Importar precios</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setCsvModal("export");setCsvText(buildCsv());}} style={{padding:"6px 14px",borderRadius:7,border:"none",background:"#16a34a",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Exportar</button>
              <button onClick={()=>{setCsvModal("import");setCsvText("");}} style={{padding:"6px 14px",borderRadius:7,border:"1.5px solid #16a34a",background:"transparent",color:"#16a34a",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Importar</button>
            </div>
          </div>
          {csvModal && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setCsvModal(null)}>
            <div style={{background:"#fff",borderRadius:14,padding:20,maxWidth:560,width:"100%",maxHeight:"80vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:14,fontWeight:700,color:D}}>{csvModal==="export"?"Exportar":"Importar"} Precios</span>
                <button onClick={()=>setCsvModal(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer"}}>✕</button>
              </div>
              {csvModal==="export" && <p style={{fontSize:11,color:"#8a7d6b",margin:"0 0 8px"}}>Copiá este texto y pegalo en Excel. Cada línea es: código + TAB + precio.</p>}
              {csvModal==="import" && <p style={{fontSize:11,color:"#8a7d6b",margin:"0 0 8px"}}>Pegá desde Excel las 2 columnas (código y precio). Acepta TAB, punto y coma o coma como separador.</p>}
              <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} readOnly={csvModal==="export"} onClick={e=>{if(csvModal==="export")e.target.select();}} style={{flex:1,minHeight:250,fontFamily:"monospace",fontSize:11,padding:10,borderRadius:8,border:"1.5px solid #e0d8cc",background:"#faf8f5",resize:"vertical",boxSizing:"border-box"}} />
              <div style={{display:"flex",gap:8,marginTop:10}}>
                {csvModal==="export" && <button onClick={()=>{try{navigator.clipboard.writeText(csvText);}catch(e){}setBkMsg("Copiado");setTimeout(()=>setBkMsg(""),2000);}} style={{...btnG,flex:1}}>Copiar al portapapeles</button>}
                {csvModal==="import" && <button onClick={doCsvImport} style={{...btnG,flex:1}}>Importar</button>}
                <button onClick={()=>setCsvModal(null)} style={{...btnO}}>Cerrar</button>
              </div>
            </div>
          </div>}

          {/* Precios count */}
          {(()=>{
            const filled = Object.values(precios).filter(v=>v>0).length;
            const total = Object.keys(precios).length;
            return <div style={{...card,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{flex:1,height:6,borderRadius:3,background:"#e0d8cc"}}>
                <div style={{height:6,borderRadius:3,background:`linear-gradient(90deg,${G},#e8c47c)`,width:`${(filled/total)*100}%`,transition:".3s"}}/>
              </div>
              <span style={{fontSize:11,fontWeight:600,color:G}}>{filled}/{total} precios cargados</span>
            </div>;
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Placas ($/m²)</div>
              {[["placaAgloBlanco","Aglo Blanco"],["placaAgloColor","Aglo Color"],["placaMdfBlanco","MDF Blanco"],["placaMdfColor","MDF Color"],["placaGloss","Gloss"],["placaFibroBlanco","Fibro Blanco 3mm"],["placaFibroColor","Fibro Color 3mm"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Cantos ($/ml)</div>
              {[["cantoBlanco04","Blanco 0.4mm"],["cantoColor04","Color 0.4mm"],["cantoBlanco2","Blanco 2mm"],["cantoColor2","Color 2mm"],["cantoGloss1","Gloss 1mm"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8,marginTop:12}}>Corte y Pegado</div>
              {[["corteComun","Corte común"],["corteGloss","Corte Gloss"],["pegado04","Pegado 0.4mm $/ml"],["pegado2","Pegado 2mm $/ml"],["pegadoGloss","Pegado Gloss $/ml"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Pistones ($/u)</div>
              {[["pistonSKON120","Hafele SKO N120"],["pistonN100","Hafele N100"],["pistonFuerzaInv","Hafele F.Inversa N100"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8,marginTop:12}}>Vidrios ($/m²)</div>
              {[["vidrioIncoloro","Incoloro"],["vidrioBronce","Bronce"],["vidrioEspejado","Espejado"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8,marginTop:12}}>LED</div>
              <PRow k="ledMl" label="LED ($/ml)" precios={precios} setP={setP}/>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8,marginTop:12}}>🚚 Transporte</div>
              <PRow k="precioKm" label="$/km" precios={precios} setP={setP}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <span style={{fontSize:11,color:"#8a7d6b",minWidth:120}}>Dirección origen:</span>
                <input value={precios.direccionOrigen||""} onChange={e=>setP("direccionOrigen",e.target.value)} style={{flex:1,padding:"4px 8px",borderRadius:5,border:"1px solid #e0d8cc",fontSize:11,fontFamily:"'DM Sans',sans-serif"}} placeholder="Tu dirección de taller"/>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Herrajes ($/u o par)</div>
              {[["bisagraComun","Bisagra común"],["bisagraCierreSuave","Bisagra CS"],["expulsorPush","Expulsor Push"],["tornillo16","Tornillo 16"],["tornillo32","Tornillo 32"],["tornillo48","Tornillo 48"],["tornillo60","Tornillo 60"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Correderas Común</div>
              {[["correderaComun30","30cm"],["correderaComun35","35cm"],["correderaComun40","40cm"],["correderaComun45","45cm"],["correderaComun","50cm (def)"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Correderas Cierre Suave</div>
              {[["correderaCS30","30cm"],["correderaCS35","35cm"],["correderaCS40","40cm"],["correderaCS45","45cm"],["correderaCS","50cm (def)"],["correderaCS55","55cm"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Correderas Push</div>
              {[["correderaPush30","30cm"],["correderaPush35","35cm"],["correderaPush45","45cm"],["correderaPush","50cm (def)"],["correderaPush55","55cm"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Correderas Angosta (Grupo Euro)</div>
              {[["correderaAng30","30cm"],["correderaAng35","35cm"],["correderaAng40","40cm"],["correderaAng45","45cm"],["correderaAng50","50cm"],["correderaAng55","55cm"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Matrix Box / Otros</div>
              {[["matrixBox450","Matrix 450"],["matrixBox","Matrix 500 (def)"],["setBarraLat","Set Barra Lateral"],["lateralMet","Lateral metálico"],["soporteEstante","Soporte estante"],["minifix","Minifix"],["soporteAlacena","Soporte alacena"],["tarugo","Tarugo"],["pataPlastica","Pata plástica"],["clipZocalo","Clip zócalo"],["escuadraSoporte","Escuadra soporte"],["pasacablePVC","Pasacable PVC"],["protectorIgnifugo","Protector ignífugo"],["tapaAuto50","Tapa autoadhesiva x50"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Tornillos (cajas para compra)</div>
              {[["cajaTorn16x200","Caja 16mm ×200"],["cajaTorn16x600","Caja 16mm ×600"],["cajaTorn32x200","Caja 32mm ×200"],["cajaTorn32x600","Caja 32mm ×600"],["cajaTorn48x300","Caja 48mm ×300"],["cajaTorn60x100","Caja 60mm ×100"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:10,fontWeight:700,color:"#b45309",margin:"8px 0 4px"}}>Consumibles (auto-calculados)</div>
              {[["embalajeFilm","Embalaje film (×placa)"],["lijaEsponja","Lija esponja (c/5 placas)"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Perfiles ($/tira 3m o $/ml)</div>
              {[["zocaloAlumMl","Zócalo aluminio $/ml"],["perfilAlumBlanco","Gola Sup. alum blanco"],["perfilAlumNegro","Gola Sup. alum negro"],["perfilAlumNatural","Gola Sup. alum natural"],["perfilMedAlumBlanco","Gola Med. alum blanco"],["perfilMedAlumNegro","Gola Med. alum negro"],["perfilMedAlumNatural","Gola Med. alum natural"],["perfilMC","Gola Sup. MC"],["perfilMH","Gola Sup. MH"],["perfilMJ","Gola Sup. MJ"],["perfilMedMC","Gola Med. MC"],["perfilMedMH","Gola Med. MH"],["perfilMedMJ","Gola Med. MJ"],["escuadraGola","Escuadra Gola $/u"],["soporteGola","Soporte Gola $/u"],["perfilTop2045","Perfil Top 20×45"],["perfilSierra","Perfil Sierra"],["perfilInterNegro","Perfil Inter negro"],["perfilInterAlum","Perfil Inter aluminio"],["escuadraAlum2045","Escuadra 20×45 $/u"],["perfilSopEstFlot","Perfil sop. est. flotante"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8,marginTop:12}}>Tiradores ($/u)</div>
              {[["tiradorClass70","Class 70mm"],["tiradorClass70Negro","Class 70mm Negro"],["tiradorBarral96L","Barral 96mm L"],["tiradorBarral128L","Barral 128mm L"],["tiradorUdineNegro192","Udine Negro 192"],["tiradorUdineAlum192","Udine Alum 192"],["manijaBarralInox128","Barral Inox 128"],["manijaBergamo96","Bergamo 96"],["tiradorBoton","Tirador Botón"],["manijaBarralEsquel128","Barral Esquel 128"]].map(([k,l])=><PRow key={k} k={k} label={l} precios={precios} setP={setP}/>)}
            </div>
          </div>
        </>}

        {/* ════ ACCESORIOS ════ */}
        {view==="accesorios" && <>
          <Sec icon="🔧" title="Accesorios"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180,1fr))",gap:12}}>
            {accesorios.map(a=>(
              <div key={a.id} style={{...card,textAlign:"center",padding:12}}>
                <div onClick={()=>imgRefs.current[a.id]?.click()} style={{width:"100%",height:100,borderRadius:7,background:a.img?`url(${a.img}) center/cover`:"linear-gradient(135deg,#f0ebe3,#e0d8cc)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:6,border:"2px dashed #d5cfc5"}}>
                  {!a.img && <span style={{fontSize:10,color:"#a09880"}}>+ Imagen</span>}
                </div>
                <input ref={el=>imgRefs.current[a.id]=el} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>setAccesorios(p=>p.map(x=>x.id===a.id?{...x,img:ev.target.result}:x));r.readAsDataURL(file);}}/>
                <input value={a.nombre} onChange={e=>setAccesorios(p=>p.map(x=>x.id===a.id?{...x,nombre:e.target.value}:x))} style={{width:"100%",border:"none",borderBottom:"1.5px solid #e0d8cc",padding:"4px 0",fontSize:12,fontWeight:600,textAlign:"center",background:"transparent",fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}} readOnly={!isAdmin}/>
                {isAdmin && <div style={{marginTop:5,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                  <MoneyInput value={a.precio||0} onChange={v=>setAccesorios(p=>p.map(x=>x.id===a.id?{...x,precio:v}:x))} style={{width:80,padding:"3px 5px",borderRadius:5,border:"1.5px solid #e0d8cc",fontSize:12,textAlign:"center",fontFamily:"'DM Sans',sans-serif",background:"#faf8f5"}}/>
                </div>}
              </div>
            ))}
            <div style={{...card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px dashed #d5cfc5",background:"transparent",minHeight:170}} onClick={()=>setAccesorios(p=>[...p,{id:"acc"+uid(),nombre:"Nuevo",precio:0,img:""}])}>
              <div style={{textAlign:"center",color:"#a09880"}}><div style={{fontSize:24}}>+</div><div style={{fontSize:11}}>Agregar</div></div>
            </div>
          </div>
        </>}

        {/* ════ RESUMEN GENERAL ════ */}
        {view==="resumen" && (()=>{
          // Combine ALL presupuestos from all sources
          const allPre = [
            ...presupuestos.map(p=>({...p, fuente:p.tipo==="personalizable"?"Personalizable":"Modular", total:calcPresupTotal(p,precios,accesorios).total})),
            ...manPres.map(mp=>{const mk=1+((mp.rentabilidad||0)/100);const ti=([...(mp.items||[]),...(mp.extras||[])]).filter(i=>(i.cantidad||0)>0).reduce((s,i)=>s+(i.precio||0)*(i.cantidad||0),0);const te=(mp.kmEnvio||0)*(precios.precioKm||0);const tot=(ti*mk+te)*(mp.iva?1.21:1);return{...mp,fuente:"Promob",total:tot,modulos:mp.items?.filter(i=>(i.cantidad||0)>0)||[]};})
          ].sort((a,b)=>(b.ultimaMod||b.fecha).localeCompare(a.ultimaMod||a.fecha));

          const enrich = (p)=>{ const cl=clientes.find(c=>c.id===p.clienteId); return {...p,cliNombre:cl?.nombre||p.cliente||"Sin cliente",cliTel:cl?.telefono||p.telefono||""}; };
          const filtered = allPre.map(enrich).filter(p=>!search || p.cliNombre.toLowerCase().includes(search.toLowerCase()) || (p.creadoPor||"").toLowerCase().includes(search.toLowerCase()));

          // Stats
          const total = allPre.length;
          const aprobados = allPre.filter(p=>p.estado==="Aprobado");
          const pendientes = allPre.filter(p=>p.estado==="Pendiente");

          return <>
            <Sec icon="📊" title="Resumen General — Todos los Presupuestos"/>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140,1fr))",gap:8,marginBottom:14}}>
              {[
                ["Total",total,"presupuestos","#93c5fd"],
                ["Aprobados",aprobados.length,`${total>0?(aprobados.length/total*100).toFixed(0):0}%`,"#7dd3a0"],
                ["Pendientes",pendientes.length,"en curso","#fbbf24"],
                ["Monto Aprob.",null,$(aprobados.reduce((s,p)=>s+p.total,0)),"#c4b5fd"],
                ["Modular",allPre.filter(p=>p.fuente==="Modular").length,"","#e8c47c"],
                ["Personalizable",allPre.filter(p=>p.fuente==="Personalizable").length,"","#f9a8d4"],
                ["Promob",allPre.filter(p=>p.fuente==="Promob").length,"","#d9f99d"],
              ].map(([t,n,sub,c],i)=>(
                <div key={i} style={{...card,textAlign:"center",padding:10}}>
                  {n!==null && <div style={{fontSize:22,fontWeight:900,color:D}}>{n}</div>}
                  <div style={{fontSize:9,fontWeight:600,color:c}}>{t}</div>
                  <div style={{fontSize:n===null?14:9,fontWeight:n===null?800:400,color:n===null?D:"#8a7d6b"}}>{sub}</div>
                </div>
              ))}
            </div>

            <input placeholder="🔍 Buscar cliente o vendedor..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:300,marginBottom:10}}/>

            {/* Table */}
            <div style={card}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>#</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Ambiente</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Tipo</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Cliente</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Vendedor</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"center"}}>Estado</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Fecha</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Últ. Mod.</th>
                  <th style={{padding:"6px 8px",background:D,color:"#fff",fontSize:9,textAlign:"right"}}>Total</th>
                </tr></thead>
                <tbody>
                  {filtered.slice(0,50).map((p,i)=>(
                    <tr key={p.id} style={{background:i%2?"#fafaf8":"#fff",cursor:"pointer"}} onClick={()=>{
                      if(p.fuente==="Promob"){setManId(p.id);setView("manEdit");}
                      else{setPreId(p.id);setCliId(p.clienteId);setView("editPre");}
                    }}>
                      <td style={{padding:"5px 8px",fontSize:11,fontWeight:700,color:G,borderBottom:"1px solid #f0ebe3"}}>#{p.numero||"—"}</td>
                      <td style={{padding:"5px 8px",fontSize:10,borderBottom:"1px solid #f0ebe3"}}>{AMB_ICONS[p.ambiente||"cocina"]||"📦"} {AMB_LABELS[p.ambiente||"cocina"]||"—"}</td>
                      <td style={{padding:"5px 8px",fontSize:10,borderBottom:"1px solid #f0ebe3"}}><span style={{padding:"2px 6px",borderRadius:6,fontSize:9,fontWeight:600,background:p.fuente==="Modular"?"#fef9c3":p.fuente==="Personalizable"?"#fce7f3":"#d9f99d",color:p.fuente==="Modular"?"#92400e":p.fuente==="Personalizable"?"#9d174d":"#365314"}}>{p.fuente}</span></td>
                      <td style={{padding:"5px 8px",fontSize:11,fontWeight:600,color:D,borderBottom:"1px solid #f0ebe3"}}>{p.cliNombre}</td>
                      <td style={{padding:"5px 8px",fontSize:10,color:"#8a7d6b",borderBottom:"1px solid #f0ebe3"}}>{p.creadoPor||"—"}</td>
                      <td style={{padding:"5px 8px",textAlign:"center",borderBottom:"1px solid #f0ebe3"}}><span style={badge(p.estado)}>{p.estado}</span></td>
                      <td style={{padding:"5px 8px",fontSize:10,color:"#8a7d6b",borderBottom:"1px solid #f0ebe3"}}>{p.fecha}</td>
                      <td style={{padding:"5px 8px",fontSize:9,color:"#a09880",borderBottom:"1px solid #f0ebe3"}}>{p.ultimaMod?new Date(p.ultimaMod).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td>
                      <td style={{padding:"5px 8px",fontSize:12,fontWeight:700,textAlign:"right",color:D,borderBottom:"1px solid #f0ebe3"}}>{$(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length>50 && <div style={{fontSize:10,color:"#999",padding:8,textAlign:"center"}}>Mostrando 50 de {filtered.length}</div>}
            </div>
          </>;
        })()}

        {/* ════ REPORTES ════ */}
        {view==="reportes" && isAdmin && (()=>{
          const now = new Date();
          const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate()-7);
          const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth()-1);
          const wStr = weekAgo.toISOString().slice(0,10);
          const mStr = monthAgo.toISOString().slice(0,10);

          // Combine all for stats
          const allMod = presupuestos;
          const allPromob = manPres;
          const allPre = [...allMod.map(p=>({...p,fuente:p.tipo==="personalizable"?"Personalizable":"Modular",total:calcPresupTotal(p,precios,accesorios).total})),
            ...allPromob.map(mp=>{const mk=1+((mp.rentabilidad||0)/100);const ti=([...(mp.items||[]),...(mp.extras||[])]).filter(i=>(i.cantidad||0)>0).reduce((s,i)=>s+(i.precio||0)*(i.cantidad||0),0);const te=(mp.kmEnvio||0)*(precios.precioKm||0);return{...mp,fuente:"Promob",total:(ti*mk+te)*(mp.iva?1.21:1)};})];

          // Stats per user
          const userStats = {};
          USERS.forEach(u=>{ userStats[u.nombre]={total:0,aprobados:0,rechazados:0,pendientes:0,montoTotal:0,montoAprobado:0,semana:0,semanaMonto:0,ambientes:{}}; });
          allPre.forEach(p=>{
            const who = p.creadoPor || "Sin asignar";
            if(!userStats[who]) userStats[who]={total:0,aprobados:0,rechazados:0,pendientes:0,montoTotal:0,montoAprobado:0,semana:0,semanaMonto:0,ambientes:{}};
            const us = userStats[who];
            us.total++; us.montoTotal += p.total;
            if(p.estado==="Aprobado"){us.aprobados++;us.montoAprobado+=p.total;}
            else if(p.estado==="Rechazado") us.rechazados++;
            else us.pendientes++;
            if(p.fecha >= wStr){us.semana++;us.semanaMonto+=p.total;}
            const amb = p.ambiente||"cocina"; us.ambientes[amb]=(us.ambientes[amb]||0)+1;
          });

          // Per ambiente stats
          const ambStats = {};
          allPre.forEach(p=>{
            const amb = p.ambiente||"cocina";
            if(!ambStats[amb]) ambStats[amb]={total:0,aprobados:0,montoTotal:0,montoAprobado:0};
            ambStats[amb].total++;
            ambStats[amb].montoTotal += p.total;
            if(p.estado==="Aprobado"){ambStats[amb].aprobados++;ambStats[amb].montoAprobado+=p.total;}
          });

          // Per fuente stats
          const fuenteStats = {};
          allPre.forEach(p=>{
            const f = p.fuente;
            if(!fuenteStats[f]) fuenteStats[f]={total:0,aprobados:0,montoTotal:0,montoAprobado:0};
            fuenteStats[f].total++;
            fuenteStats[f].montoTotal += p.total;
            if(p.estado==="Aprobado"){fuenteStats[f].aprobados++;fuenteStats[f].montoAprobado+=p.total;}
          });

          // Conversion funnel
          const totalPre = allPre.length;
          const totalAprob = allPre.filter(p=>p.estado==="Aprobado").length;
          const totalRech = allPre.filter(p=>p.estado==="Rechazado").length;
          const totalPend = allPre.filter(p=>p.estado==="Pendiente").length;
          const tasaConv = totalPre>0?(totalAprob/totalPre*100).toFixed(1):0;
          const ticketPromedio = totalAprob>0?(allPre.filter(p=>p.estado==="Aprobado").reduce((s,p)=>s+p.total,0)/totalAprob):0;

          const presWeek = allPre.filter(p=>p.fecha>=wStr);
          const presMonth = allPre.filter(p=>p.fecha>=mStr);

          const thS={padding:"6px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left"};
          const tdS={padding:"6px 10px",borderBottom:"1px solid #eee",fontSize:11};
          const tdR={...tdS,textAlign:"right",fontWeight:700};

          return <>
            <Sec icon="📈" title="Reportes Estratégicos"/>

            {/* KPI Dashboard */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130,1fr))",gap:8,marginBottom:14}}>
              {[
                ["Total Presupuestos",totalPre,"todos","#93c5fd"],
                ["Aprobados",totalAprob,`${tasaConv}% conversión`,"#7dd3a0"],
                ["Pendientes",totalPend,"en curso","#fbbf24"],
                ["Rechazados",totalRech,"perdidos","#f87171"],
                ["Ticket Promedio",null,$(ticketPromedio),"#c4b5fd"],
                ["Monto Aprobado",null,$(allPre.filter(p=>p.estado==="Aprobado").reduce((s,p)=>s+p.total,0)),"#7dd3a0"],
                ["Esta Semana",presWeek.length,`${presWeek.filter(p=>p.estado==="Aprobado").length} aprob.`,"#e8c47c"],
                ["Este Mes",presMonth.length,`${presMonth.filter(p=>p.estado==="Aprobado").length} aprob.`,"#a78bfa"],
              ].map(([t,n,sub,c],i)=>(
                <div key={i} style={{...card,textAlign:"center",padding:10}}>
                  {n!==null && <div style={{fontSize:22,fontWeight:900,color:D}}>{n}</div>}
                  <div style={{fontSize:9,fontWeight:600,color:c}}>{t}</div>
                  <div style={{fontSize:n===null?14:9,fontWeight:n===null?800:400,color:n===null?D:"#8a7d6b"}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Conversion Funnel */}
            <Sec icon="🎯" title="Embudo de Conversión"/>
            <div style={card}>
              {[["Presupuestos generados",totalPre,100,"#93c5fd"],["En curso (Pendientes)",totalPend,totalPre>0?totalPend/totalPre*100:0,"#fbbf24"],["Aprobados (Vendidos)",totalAprob,totalPre>0?totalAprob/totalPre*100:0,"#16a34a"],["Rechazados (Perdidos)",totalRech,totalPre>0?totalRech/totalPre*100:0,"#f87171"]].map(([label,count,pct,color],i)=>(
                <div key={i} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                    <span style={{fontWeight:600}}>{label}</span>
                    <span><b>{count}</b> ({typeof pct==="number"?pct.toFixed(0):pct}%)</span>
                  </div>
                  <div style={{height:14,background:"#f0ebe3",borderRadius:7,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:color,borderRadius:7,transition:".5s"}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Per Vendedor */}
            <Sec icon="👤" title="Rendimiento por Vendedor"/>
            <div style={card}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><th style={thS}>Vendedor</th><th style={{...thS,textAlign:"center"}}>Total</th><th style={{...thS,textAlign:"center",color:"#7dd3a0"}}>Aprob.</th><th style={{...thS,textAlign:"center"}}>%Conv.</th><th style={{...thS,textAlign:"center",color:"#fbbf24"}}>Pend.</th><th style={{...thS,textAlign:"right"}}>Monto Total</th><th style={{...thS,textAlign:"right",color:"#7dd3a0"}}>Monto Aprob.</th><th style={{...thS,textAlign:"center"}}>Semana</th></tr></thead>
                <tbody>{Object.entries(userStats).filter(([,v])=>v.total>0).sort((a,b)=>b[1].montoAprobado-a[1].montoAprobado).map(([nom,v],i)=>(
                  <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                    <td style={{...tdS,fontWeight:700}}>{nom}</td>
                    <td style={{...tdS,textAlign:"center"}}>{v.total}</td>
                    <td style={{...tdS,textAlign:"center",color:"#16a34a",fontWeight:700}}>{v.aprobados}</td>
                    <td style={{...tdS,textAlign:"center",fontWeight:700,color:v.total>0&&v.aprobados/v.total>.3?"#16a34a":"#a16207"}}>{v.total>0?(v.aprobados/v.total*100).toFixed(0):0}%</td>
                    <td style={{...tdS,textAlign:"center",color:"#a16207"}}>{v.pendientes}</td>
                    <td style={tdR}>{$(v.montoTotal)}</td>
                    <td style={{...tdR,color:"#16a34a"}}>{$(v.montoAprobado)}</td>
                    <td style={{...tdS,textAlign:"center",fontWeight:700}}>{v.semana}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            {/* Per Ambiente */}
            <Sec icon="🏠" title="Por Tipo de Ambiente"/>
            <div style={card}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><th style={thS}>Ambiente</th><th style={{...thS,textAlign:"center"}}>Total</th><th style={{...thS,textAlign:"center",color:"#7dd3a0"}}>Aprob.</th><th style={{...thS,textAlign:"center"}}>%Conv.</th><th style={{...thS,textAlign:"right"}}>Monto Total</th><th style={{...thS,textAlign:"right",color:"#7dd3a0"}}>Monto Aprob.</th></tr></thead>
                <tbody>{Object.entries(ambStats).sort((a,b)=>b[1].total-a[1].total).map(([amb,v],i)=>(
                  <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                    <td style={{...tdS,fontWeight:700}}>{AMB_ICONS[amb]||"📦"} {AMB_LABELS[amb]||amb}</td>
                    <td style={{...tdS,textAlign:"center"}}>{v.total}</td>
                    <td style={{...tdS,textAlign:"center",color:"#16a34a",fontWeight:700}}>{v.aprobados}</td>
                    <td style={{...tdS,textAlign:"center",fontWeight:700}}>{v.total>0?(v.aprobados/v.total*100).toFixed(0):0}%</td>
                    <td style={tdR}>{$(v.montoTotal)}</td>
                    <td style={{...tdR,color:"#16a34a"}}>{$(v.montoAprobado)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            {/* Per Tipo Presupuesto */}
            <Sec icon="📋" title="Por Tipo de Presupuesto"/>
            <div style={card}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {Object.entries(fuenteStats).map(([f,v],i)=>(
                  <div key={i} style={{textAlign:"center",padding:12,borderRadius:10,background:f==="Modular"?"#fef9c3":f==="Personalizable"?"#fce7f3":"#ecfccb",border:"1px solid #e0d8cc"}}>
                    <div style={{fontSize:20,fontWeight:900,color:D}}>{v.total}</div>
                    <div style={{fontSize:11,fontWeight:700,color:G}}>{f}</div>
                    <div style={{fontSize:10,color:"#16a34a",fontWeight:600}}>{v.aprobados} aprobados</div>
                    <div style={{fontSize:10,color:"#8a7d6b"}}>{$(v.montoAprobado)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendedor × Ambiente matrix */}
            <Sec icon="📊" title="Matriz Vendedor × Ambiente"/>
            <div style={card}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead><tr><th style={thS}>Vendedor</th>{Object.keys(ambStats).sort().map(a=><th key={a} style={{...thS,textAlign:"center"}}>{AMB_ICONS[a]||""} {AMB_LABELS[a]||a}</th>)}<th style={{...thS,textAlign:"center",color:G}}>Total</th></tr></thead>
                <tbody>{Object.entries(userStats).filter(([,v])=>v.total>0).map(([nom,v],i)=>(
                  <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                    <td style={{...tdS,fontWeight:700,fontSize:10}}>{nom}</td>
                    {Object.keys(ambStats).sort().map(a=><td key={a} style={{...tdS,textAlign:"center",fontSize:10,fontWeight:v.ambientes[a]?700:400,color:v.ambientes[a]?D:"#ccc"}}>{v.ambientes[a]||"—"}</td>)}
                    <td style={{...tdS,textAlign:"center",fontWeight:700,color:G}}>{v.total}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>;
        })()}

        {/* ════ AUDITORÍA & BACKUPS ════ */}
        {view==="audit" && isAdmin && (()=>{
          return <>
            <Sec icon="🔒" title="Auditoría y Copias de Seguridad"/>

            {/* Backups */}
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,color:D,marginBottom:10}}>💾 Copias de Seguridad</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <button onClick={doBackup} style={{...btnG,padding:"10px 16px",fontSize:12}}>📥 Descargar Backup JSON</button>
                <button onClick={doBackupStorage} style={{...btnO,padding:"10px 16px",fontSize:12}}>☁️ Guardar en Storage</button>
                <label style={{...btnO,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 16px",fontSize:12}}>
                  📂 Restaurar desde archivo .json
                  <input type="file" accept=".json" onChange={doRestore} style={{display:"none"}}/>
                </label>
                <button onClick={()=>{
                  if(confirmDel?.type==="restStorage") { doRestoreStorage(); setConfirmDel(null); }
                  else setConfirmDel({type:"restStorage"});
                }} style={{...btnO,borderColor:confirmDel?.type==="restStorage"?"#dc2626":"#93c5fd",color:confirmDel?.type==="restStorage"?"#dc2626":"#3b82f6",padding:"10px 16px",fontSize:12,fontWeight:confirmDel?.type==="restStorage"?700:600}}>{confirmDel?.type==="restStorage"?"⚠️ Confirmar restaurar Storage":"☁️ Restaurar desde Storage"}</button>
                <button onClick={()=>{
                  if(confirmDel?.type==="restLocal") {
                    try {
                      const raw = localStorage.getItem("v2_autobackup");
                      if(!raw) { setBkMsg("⚠ No hay auto-backup local"); setTimeout(()=>setBkMsg(""),3000); setConfirmDel(null); return; }
                      const data = JSON.parse(raw);
                      setPrecios({...defPrecios,...(data.precios||{})});
                      setAccesorios(data.accesorios||ACCESORIOS_INIT);
                      setClientes(data.clientes||[]);
                      setPresupuestos(data.presupuestos||[]);
                      setManPres(data.manPres||[]);setPagos(data.pagos||[]);setOcChecked(data.ocChecked||{});if(data.papelera)setPapelera(data.papelera);
                      setPreciosUpd(data.preciosUpd||"");
                      addLog("Restaurar auto-backup","Desde localStorage");
                      setBkMsg("✅ Auto-backup restaurado"); setTimeout(()=>setBkMsg(""),3000);
                    } catch(e) { setBkMsg("⚠ Error: "+e.message); setTimeout(()=>setBkMsg(""),4000); }
                    setConfirmDel(null);
                  } else setConfirmDel({type:"restLocal"});
                }} style={{...btnO,borderColor:confirmDel?.type==="restLocal"?"#dc2626":"#a78bfa",color:confirmDel?.type==="restLocal"?"#dc2626":"#7c3aed",padding:"10px 16px",fontSize:12,fontWeight:confirmDel?.type==="restLocal"?700:600}}>{confirmDel?.type==="restLocal"?"⚠️ Confirmar restaurar local":"💻 Restaurar auto-backup local"}</button>
              </div>
              {bkMsg && <div style={{padding:8,borderRadius:6,fontSize:12,fontWeight:600,background:bkMsg.includes("⚠")?"#fee2e2":"#dcfce7",color:bkMsg.includes("⚠")?"#dc2626":"#16a34a",marginBottom:8}}>{bkMsg}</div>}
              <div style={{padding:10,background:"#f0fdf4",borderRadius:8,fontSize:10,color:"#166534",border:"1px solid #bbf7d0"}}>
                <div style={{fontWeight:700,marginBottom:4}}>📊 Estado de datos</div>
                <div>{clientes.length} clientes · {presupuestos.length} modulares · {manPres.length} Promob · {pagos.length} pagos</div>
                <div style={{marginTop:4,color:"#8a7d6b"}}>💡 El sistema guarda automáticamente en Storage (nube) y localStorage (navegador) después de cada cambio. Descargá un backup JSON periódicamente como seguro adicional.</div>
              </div>
            </div>

            {/* Papelera de Reciclaje */}
            <div style={{...card,marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,color:D}}>🗑️ Papelera de Reciclaje <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>({papelera.length} elementos, máx 50)</span></div>
                {papelera.length>0 && <button onClick={()=>{setPapelera([]); addLog("Vaciar papelera","");}} style={{fontSize:9,color:"#dc2626",background:"transparent",border:"1px solid #fca5a5",borderRadius:4,padding:"2px 8px",cursor:"pointer"}}>Vaciar papelera</button>}
              </div>
              {papelera.length===0 && <div style={{fontSize:11,color:"#999",padding:10}}>La papelera está vacía.</div>}
              {papelera.map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderBottom:"1px solid #f0ebe3",background:i%2?"#fafaf8":"#fff"}}>
                  <div style={{flex:1}}>
                    {item.tipo==="cliente" && <>
                      <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"#fee2e2",color:"#dc2626",fontWeight:600}}>Cliente</span>
                      <span style={{marginLeft:6,fontSize:12,fontWeight:700,color:D}}>{item.cliente?.nombre||"Sin nombre"}</span>
                      <span style={{marginLeft:6,fontSize:10,color:"#8a7d6b"}}>{item.cliente?.telefono||""}</span>
                      <span style={{marginLeft:6,fontSize:9,color:"#a09880"}}>{(item.presupuestos||[]).length} presup.</span>
                    </>}
                    {item.tipo==="presupuesto" && <>
                      <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"#fef9c3",color:"#92400e",fontWeight:600}}>Presupuesto</span>
                      <span style={{marginLeft:6,fontSize:12,fontWeight:700,color:D}}>#{item.presupuesto?.numero||"?"}</span>
                      <span style={{marginLeft:6,fontSize:11,color:G}}>{item.clienteNombre||""}</span>
                    </>}
                    <div style={{fontSize:9,color:"#a09880",marginTop:2}}>Borrado por {item.borradoPor} el {new Date(item.fecha).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{
                      if(item.tipo==="cliente") {
                        // Restore client + their presupuestos
                        if(item.cliente) setClientes(prev=>[...prev,item.cliente]);
                        if(item.presupuestos?.length>0) setPresupuestos(prev=>[...prev,...item.presupuestos]);
                        addLog("Restaurar cliente",item.cliente?.nombre||"");
                      } else if(item.tipo==="presupuesto") {
                        if(item.presupuesto) setPresupuestos(prev=>[...prev,item.presupuesto]);
                        addLog("Restaurar presupuesto",`#${item.presupuesto?.numero||"?"} de ${item.clienteNombre||""}`);
                      }
                      setPapelera(prev=>prev.filter((_,j)=>j!==i));
                    }} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #16a34a",background:"#f0fdf4",color:"#16a34a",fontSize:10,fontWeight:600,cursor:"pointer"}}>♻️ Restaurar</button>
                    <button onClick={()=>{
                      if(confirmDel?.type==="trash"&&confirmDel?.id===i) {
                        setPapelera(prev=>prev.filter((_,j)=>j!==i));
                        addLog("Borrar permanente",item.tipo==="cliente"?item.cliente?.nombre||"":`#${item.presupuesto?.numero||""}`);
                        setConfirmDel(null);
                      } else setConfirmDel({type:"trash",id:i});
                    }} style={{padding:"4px 8px",borderRadius:6,border:"1px solid #fca5a5",background:confirmDel?.type==="trash"&&confirmDel?.id===i?"#dc2626":"transparent",color:confirmDel?.type==="trash"&&confirmDel?.id===i?"#fff":"#dc2626",fontSize:10,fontWeight:600,cursor:"pointer"}}>{confirmDel?.type==="trash"&&confirmDel?.id===i?"¿Seguro?":"✕"}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Log */}
            <div style={{...card,marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,color:D}}>📋 Registro de Cambios <span style={{fontSize:10,fontWeight:400,color:"#8a7d6b"}}>({auditLog.length} registros, máx 500)</span></div>
                {auditLog.length>0 && <button onClick={()=>{{ setAuditLog([]); try{localStorage.removeItem("v2audit");}catch(e){} addLog("Limpiar log",""); }}} style={{fontSize:9,color:"#dc2626",background:"transparent",border:"1px solid #fca5a5",borderRadius:4,padding:"2px 8px",cursor:"pointer"}}>Limpiar log</button>}
              </div>
              {auditLog.length===0 && <div style={{fontSize:11,color:"#999",padding:10}}>Sin registros aún.</div>}
              <div style={{maxHeight:500,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  {auditLog.length>0 && <thead><tr>
                    <th style={{padding:"5px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Fecha/Hora</th>
                    <th style={{padding:"5px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Usuario</th>
                    <th style={{padding:"5px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Acción</th>
                    <th style={{padding:"5px 8px",background:D,color:"#fff",fontSize:9,textAlign:"left"}}>Detalle</th>
                  </tr></thead>}
                  <tbody>
                    {auditLog.slice(0,100).map((l,i)=>(
                      <tr key={l.id} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={{padding:"4px 8px",fontSize:9,color:"#8a7d6b",borderBottom:"1px solid #f0ebe3",whiteSpace:"nowrap"}}>{new Date(l.ts).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"})}</td>
                        <td style={{padding:"4px 8px",fontSize:10,fontWeight:600,color:D,borderBottom:"1px solid #f0ebe3"}}>{l.usuario}</td>
                        <td style={{padding:"4px 8px",fontSize:10,borderBottom:"1px solid #f0ebe3"}}><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:600,background:l.accion.includes("Eliminar")?"#fee2e2":l.accion.includes("Aprobar")?"#dcfce7":l.accion.includes("Backup")?"#e0e7ff":"#fef9c3",color:l.accion.includes("Eliminar")?"#dc2626":l.accion.includes("Aprobar")?"#16a34a":l.accion.includes("Backup")?"#3730a3":"#92400e"}}>{l.accion}</span></td>
                        <td style={{padding:"4px 8px",fontSize:10,color:"#555",borderBottom:"1px solid #f0ebe3"}}>{l.detalle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>;
        })()}

        {/* ════ COMPRAS ════ */}
        {view==="compras" && (()=>{
          const aprobados = presupuestos.filter(p=>p.estado==="Aprobado");
          const pendientes = presupuestos.filter(p=>p.estado==="Pendiente");
          const rechazados = presupuestos.filter(p=>p.estado==="Rechazado");
          const totalAprob = aprobados.reduce((s,pr)=>s+calcPresupTotal(pr,precios,accesorios).total,0);
          const toggleOc = (id)=>setOcSel(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

          // Combined OC
          let ocPlan = null;
          if(ocSel.length>0) {
            const combined = { boards:{}, cantos:{}, cortes:{comun:0,gloss:0}, pegado:{p04:0,p2:0,pGloss:0}, herrajes:{} };
            ocSel.forEach(pid=>{
              const pr = presupuestos.find(p=>p.id===pid);
              if(!pr) return;
              const plan = calcPlanilla(pr, precios);
              // Merge boards
              Object.entries(plan.boards).forEach(([k,{m2,placas,precioUnit,costo}])=>{
                if(!combined.boards[k]) combined.boards[k]={m2:0,placas:0,precioUnit:precioUnit||0};
                combined.boards[k].m2 += m2;
              });
              // Merge cantos
              Object.entries(plan.cantos).forEach(([k,v])=>{
                if(!combined.cantos[k]) combined.cantos[k]={mlBase:0,mlExtra:0,ml:0,precioMl:v.precioMl||0};
                combined.cantos[k].mlBase += v.mlBase||0;
                combined.cantos[k].mlExtra += v.mlExtra||0;
                combined.cantos[k].ml += v.ml;
              });
              // Merge cortes
              combined.cortes.comun += plan.cortes.comun;
              combined.cortes.gloss += plan.cortes.gloss;
              // Merge pegado
              combined.pegado.p04 += plan.pegado.p04;
              combined.pegado.p2 += plan.pegado.p2;
              combined.pegado.pGloss += plan.pegado.pGloss;
              // Merge herrajes
              Object.entries(plan.herrajes).forEach(([k,v])=>{ combined.herrajes[k]=(combined.herrajes[k]||0)+v; });
            });
            // Recalc boards (placas) from combined m2
            Object.entries(combined.boards).forEach(([k,v])=>{
              const bSize = k.includes("Gloss")?BOARD.gloss:k.includes("fibro")?BOARD.fibro:k.includes("MDF")?BOARD.mdf:BOARD.aglo;
              v.m2 = +v.m2.toFixed(2);
              v.placas = Math.ceil(v.m2/bSize);
              v.costo = v.placas * (v.precioUnit||0);
            });
            Object.entries(combined.cantos).forEach(([k,v])=>{
              v.mlBase = +v.mlBase.toFixed(2);
              v.mlExtra = +v.mlExtra.toFixed(2);
              v.ml = +v.ml.toFixed(2);
              v.costo = v.ml * (v.precioMl||0);
            });
            ocPlan = combined;
          }

          const thS = {padding:"6px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left"};
          const tdS = {padding:"5px 10px",borderBottom:"1px solid #eee",fontSize:11};
          const tdR = {...tdS,textAlign:"right",fontWeight:700};

          return <>
            <Sec icon="🛒" title="Compras — Resumen"/>
            <div style={{background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,textAlign:"center"}}>
                <div><div style={{fontSize:26,fontWeight:900,color:"#e8c47c"}}>{aprobados.length}</div><div style={{fontSize:10,color:"#a09880"}}>Aprobados</div></div>
                <div><div style={{fontSize:26,fontWeight:900,color:"#7dd3a0"}}>{pendientes.length}</div><div style={{fontSize:10,color:"#a09880"}}>Pendientes</div></div>
                <div><div style={{fontSize:26,fontWeight:900,color:"#f87171"}}>{rechazados.length}</div><div style={{fontSize:10,color:"#a09880"}}>Rechazados</div></div>
              </div>
            </div>

            {/* Selección de presupuestos para OC */}
            <Sec icon="📋" title="Orden de Compra" right={ocSel.length>0 && <span style={{fontSize:11,color:G,fontWeight:700}}>{ocSel.length} seleccionados</span>}/>
            <div style={card}>
              <div style={{fontSize:11,color:"#8a7d6b",marginBottom:8}}>Seleccioná los presupuestos para generar una orden de compra combinada:</div>
              {presupuestos.filter(p=>p.estado!=="Rechazado").map(pr=>{
                const cn = clientes.find(c=>c.id===pr.clienteId)?.nombre||"";
                const t = calcPresupTotal(pr,precios,accesorios);
                const sel = ocSel.includes(pr.id);
                return(
                  <div key={pr.id} onClick={()=>toggleOc(pr.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderBottom:"1px solid #f0ebe3",cursor:"pointer",background:sel?"#fef9c3":"transparent",borderRadius:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${sel?G:"#d5cfc5"}`,background:sel?G:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:900}}>{sel?"✓":""}</div>
                      <span style={{fontWeight:700,color:G}}>#{pr.numero}</span>
                      <span style={{fontSize:12}}>{cn}</span>
                      <span style={badge(pr.estado)}>{pr.estado}</span>
                      <span style={{fontSize:10,color:"#8a7d6b"}}>{(pr.modulos||[]).length} mód.</span>
                    </div>
                    {isAdmin && <span style={{fontWeight:700,fontSize:13}}>{$(t.total)}</span>}
                  </div>
                );
              })}
              {presupuestos.filter(p=>p.estado!=="Rechazado").length===0 && <div style={{fontSize:12,color:"#999"}}>No hay presupuestos</div>}
            </div>

            {/* OC Combinada */}
            {ocPlan && (()=>{
              // Collect all OC items for checkboxes
              const allOcItems = [];
              Object.entries(ocPlan.boards).forEach(([nom,b])=>allOcItems.push({key:"b_"+nom,nom,val:`${b.m2} m² → ${b.placas} placas`,cat:"Placas"}));
              Object.entries(ocPlan.cantos).forEach(([nom,c])=>allOcItems.push({key:"c_"+nom,nom,val:`${c.mlBase} + ${c.mlExtra} = ${c.ml} ml`,cat:"Cantos"}));
              if(ocPlan.cortes.comun>0) allOcItems.push({key:"ct_comun",nom:"Corte Común",val:ocPlan.cortes.comun,cat:"Cortes"});
              if(ocPlan.cortes.gloss>0) allOcItems.push({key:"ct_gloss",nom:"Corte Gloss",val:ocPlan.cortes.gloss,cat:"Cortes"});
              if(ocPlan.pegado.p04>0) allOcItems.push({key:"pg_04",nom:"Pegado 0.4mm",val:ocPlan.pegado.p04.toFixed(2)+" ml",cat:"Pegado"});
              if(ocPlan.pegado.p2>0) allOcItems.push({key:"pg_2",nom:"Pegado 2mm",val:ocPlan.pegado.p2.toFixed(2)+" ml",cat:"Pegado"});
              if(ocPlan.pegado.pGloss>0) allOcItems.push({key:"pg_gl",nom:"Pegado Gloss",val:ocPlan.pegado.pGloss.toFixed(2)+" ml",cat:"Pegado"});
              Object.entries(ocPlan.herrajes).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([nom,cant])=>allOcItems.push({key:"h_"+nom,nom,val:cant,cat:"Herrajes"}));

              const allChecked = allOcItems.every(it=>ocChecked[it.key]);
              const toggleAll = ()=>{
                const nw = {...ocChecked};
                const setTo = !allChecked;
                allOcItems.forEach(it=>{nw[it.key]=setTo;});
                setOcChecked(nw);
              };
              const toggleItem = (k)=>setOcChecked(p=>({...p,[k]:!p[k]}));

              // Installation dates from selected presupuestos
              const instalInfo = ocSel.map(id=>{
                const p=presupuestos.find(x=>x.id===id);
                if(!p?.fechaInstalacion) return null;
                const cn=clientes.find(c=>c.id===p.clienteId)?.nombre||"";
                return {num:p.numero,cliente:cn,fecha:p.fechaInstalacion};
              }).filter(Boolean);

              return <>
                <Sec icon="🛒" title="Orden de Compra Combinada" right={<div style={{display:"flex",gap:6}}><button onClick={toggleAll} className="no-print" style={btnO}>{allChecked?"Desmarcar":"✓ Marcar"} todos</button><button onClick={()=>doPrint(printRef.current, "Orden de Compra " + new Date().toLocaleDateString("es-AR").replace(/\//g,"-"))} className="no-print" style={btnG}>📥 Descargar PDF</button></div>}/>
                <div ref={printRef} style={{...card,border:`2px solid ${G}`}}>
                  <div style={{textAlign:"center",marginBottom:12}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:900,color:D}}>ORDEN DE COMPRA</div>
                    <div style={{fontSize:10,color:"#8a7d6b"}}>{ocSel.length} presupuestos — {new Date().toLocaleDateString("es-AR")}</div>
                    <div style={{fontSize:10,color:"#8a7d6b"}}>{ocSel.map(id=>{const p=presupuestos.find(x=>x.id===id);const c=clientes.find(x=>x.id===p?.clienteId);return `#${p?.numero} ${c?.nombre||""}`;}).join(" · ")}</div>
                  </div>

                  {/* Fechas de instalación */}
                  {instalInfo.length>0 && <div style={{marginBottom:14,padding:10,background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#16a34a",marginBottom:6}}>📅 Fechas de Instalación</div>
                    {instalInfo.map((c,i)=>(
                      <div key={i} style={{fontSize:10,marginBottom:3}}>
                        <b>#{c.num} {c.cliente}:</b> {c.fecha}
                      </div>
                    ))}
                  </div>}

                  {/* Items with checkboxes grouped by category */}
                  {["Placas","Cantos","Cortes","Pegado","Herrajes"].map(cat=>{
                    const items = allOcItems.filter(it=>it.cat===cat);
                    if(items.length===0) return null;
                    const icon = cat==="Placas"?"📦":cat==="Cantos"?"📏":cat==="Cortes"?"✂️":cat==="Pegado"?"🧲":"🔩";
                    return <div key={cat} style={{marginBottom:12}}>
                      <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:4}}>{icon} {cat}</div>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <tbody>{items.map((it,i)=>{
                          const checked = !!ocChecked[it.key];
                          return <tr key={i} style={{background:checked?"#f0fdf4":i%2?"#fafaf8":"#fff",cursor:"pointer"}} onClick={()=>toggleItem(it.key)}>
                            <td style={{width:30,padding:"5px 8px",textAlign:"center"}}><div style={{width:16,height:16,borderRadius:3,border:`2px solid ${checked?"#16a34a":"#d5cfc5"}`,background:checked?"#16a34a":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11}}>✓</div></td>
                            <td style={{...tdS,textDecoration:checked?"line-through":"none",color:checked?"#9ca3af":"#333"}}>{it.nom}</td>
                            <td style={{...tdR,textDecoration:checked?"line-through":"none",color:checked?"#9ca3af":G}}>{it.val}</td>
                          </tr>;
                        })}</tbody>
                      </table>
                    </div>;
                  })}
                </div>
              </>;
            })()}
          </>;
        })()}

        {/* ════ PRESUPUESTO MANUAL ════ */}
        {view==="promob" && (()=>{
          const mp = manPres.find(m=>m.id===manId);
          const updMan = (id,u)=>setManPres(p=>p.map(x=>x.id===id?{...x,...u,ultimaMod:new Date().toISOString()}:x));

          // Build items from CATALOGO with current precios
          const buildItems = ()=>{
            const items = [];
            CATALOGO.forEach(grp=>grp.items.forEach(([k,label])=>{
              items.push({uid:uid(),key:k,descripcion:label,precio:precios[k]||0,cantidad:0,cat:grp.cat});
            }));
            // Add accesorios
            accesorios.forEach(a=>{
              if(a.precio>0) items.push({uid:uid(),key:"acc_"+a.id,descripcion:a.nombre,precio:a.precio,cantidad:0,cat:"Accesorios"});
            });
            return items;
          };

          // ── List view ──
          if(!mp) return <>
            <Sec icon="📋" title="Presupuestos Promob"/>
            {/* New presupuesto: client picker */}
            <div style={{...card,marginBottom:12,padding:12}}>
              <div style={{fontSize:11,fontWeight:700,color:D,marginBottom:8}}>Nuevo presupuesto — Elegí un cliente:</div>
              <input id="promobCliSearch" placeholder="🔍 Buscar cliente por nombre..." onChange={e=>{
                const v=e.target.value.toLowerCase();
                document.querySelectorAll('[data-promob-cli]').forEach(el=>{el.style.display=el.dataset.promobCli.toLowerCase().includes(v)?'':'none';});
              }} style={{...inp,marginBottom:8,fontSize:12}}/>
              <div style={{maxHeight:200,overflowY:"auto",border:"1px solid #e0d8cc",borderRadius:8}}>
                {clientes.sort((a,b)=>(b.creado||"").localeCompare(a.creado||"") || (a.nombre||"").localeCompare(b.nombre||"")).map(c=>(
                  <div key={c.id} data-promob-cli={c.nombre||""} onClick={()=>{
                    const m={id:uid(),clienteId:c.id,cliente:c.nombre||"",telefono:c.telefono||"",fecha:new Date().toISOString().slice(0,10),estado:"Pendiente",creadoPor:user?.nombre||"",items:buildItems(),extras:[],rentabilidad:30,iva:false,notas:"",colorSpec:""};
                    setManPres(p=>[...p,m]); setManId(m.id);
                  }} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #f0ebe3",fontSize:12,transition:".15s"}} onMouseEnter={e=>e.currentTarget.style.background="#fef9c3"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div>
                      <span style={{fontWeight:700,color:D}}>{c.nombre||"Sin nombre"}</span>
                      {c.telefono && <span style={{marginLeft:8,fontSize:10,color:"#8a7d6b"}}>📱 {c.telefono}</span>}
                      {c.direccion && <span style={{marginLeft:8,fontSize:10,color:"#a09880"}}>📍 {c.direccion.slice(0,30)}{c.direccion.length>30?"...":""}</span>}
                    </div>
                    <span style={{fontSize:9,color:"#a09880"}}>{c.creado||""}</span>
                  </div>
                ))}
                {clientes.length===0 && <div style={{padding:12,textAlign:"center",fontSize:11,color:"#a09880"}}>No hay clientes. Creá uno en 👥 Clientes.</div>}
              </div>
            </div>

            {/* List of existing promob presupuestos */}
            <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:8}}>Presupuestos existentes</div>
            <input placeholder="🔍 Buscar presupuesto..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:260,marginBottom:12}}/>
            {manPres.length===0 && <div style={{...card,textAlign:"center",color:"#8a7d6b",fontSize:13,padding:30}}>No hay presupuestos Promob.</div>}
            {manPres.filter(m=>!search || (m.cliente||"").toLowerCase().includes(search.toLowerCase())).sort((a,b)=>(b.ultimaMod||b.fecha||"").localeCompare(a.ultimaMod||a.fecha||"")).map(m=>{
              const cl_=clientes.find(c=>c.id===m.clienteId);
              const cliNom = cl_?.nombre || m.cliente || "Sin cliente";
              const cliTel = cl_?.telefono || m.telefono || "";
              const totItems = (m.items||[]).reduce((s,it)=>s+(it.precio||0)*(it.cantidad||0),0) + (m.extras||[]).reduce((s,it)=>s+(it.precio||0)*(it.cantidad||0),0);
              const tenvioList = (m.kmEnvio||0) * (precios.precioKm||0);
              const totFinal = (totItems * (1+(m.rentabilidad||0)/100) + tenvioList) * (m.iva?1.21:1);
              const usados = (m.items||[]).filter(it=>(it.cantidad||0)>0).length + (m.extras||[]).filter(it=>(it.cantidad||0)>0).length;
              return(
                <div key={m.id} onClick={()=>setManId(m.id)} style={{...card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px"}}>
                  <div>
                    <span style={{fontWeight:700,color:D,fontSize:13}}>{cliNom}</span>
                    {cliTel && <span style={{fontSize:10,color:"#8a7d6b",marginLeft:6}}>📱 {cliTel}</span>}
                    <span style={{fontSize:11,color:"#8a7d6b",marginLeft:8}}>{m.fecha}</span>
                    <span style={{...badge(m.estado),marginLeft:8}}>{m.estado}</span>
                    <span style={{fontSize:10,color:"#8a7d6b",marginLeft:8}}>{usados} ítems</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:700,fontSize:14,color:D}}>{$(totFinal)}</span>
                    {m.estado==="Aprobado" && <button onClick={e=>{e.stopPropagation();duplicarPromob(m.id);}} style={{fontSize:9,padding:"4px 8px",borderRadius:5,border:`1px solid ${G}`,background:"transparent",color:G,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,whiteSpace:"nowrap"}} title="Duplicar con precios actuales">🔄 Actualizar</button>}
                    {isAdmin && <button onClick={e=>{e.stopPropagation();setManPres(p=>p.filter(x=>x.id!==m.id));}} style={btnD}>×</button>}
                  </div>
                </div>
              );
            })}
          </>;

          // ── Edit view ──
          const allItems = mp.items || [];
          const extras = mp.extras || [];
          const totItems = allItems.reduce((s,it)=>s+(it.precio||0)*(it.cantidad||0),0) + extras.reduce((s,it)=>s+(it.precio||0)*(it.cantidad||0),0);
          const rent = totItems * ((mp.rentabilidad||0)/100);
          const subConRent = totItems + rent;
          const tenvioMan = (mp.kmEnvio||0) * (precios.precioKm||0);
          const ivaAmt = mp.iva ? (subConRent + tenvioMan) * 0.21 : 0;
          const totFinal = subConRent + tenvioMan + ivaAmt;
          const mk = 1 + ((mp.rentabilidad||0)/100);
          const updItem = (u,k,v)=>updMan(mp.id,{items:allItems.map(it=>it.uid===u?{...it,[k]:v}:it)});
          const updExtra = (u,k,v)=>updMan(mp.id,{extras:extras.map(it=>it.uid===u?{...it,[k]:v}:it)});
          const addExtra = ()=>updMan(mp.id,{extras:[...extras,{uid:uid(),descripcion:"",precio:0,cantidad:1}]});
          const rmExtra = (u)=>updMan(mp.id,{extras:extras.filter(it=>it.uid!==u)});

          // Sync precios: update items that still have original price
          const syncPrecios = ()=>{
            const updated = allItems.map(it=>({...it, precio: precios[it.key]||it.precio}));
            updMan(mp.id,{items:updated});
          };

          // Group items by cat
          const cats = [];
          const seen = new Set();
          allItems.forEach(it=>{
            if(!seen.has(it.cat)){seen.add(it.cat);cats.push(it.cat);}
          });

          const usados = allItems.filter(it=>(it.cantidad||0)>0).length + extras.filter(it=>(it.cantidad||0)>0).length;

          return <>
            <button onClick={()=>setManId(null)} style={{...btnO,marginBottom:10}}>← Presupuestos Promob</button>
            {(()=>{ const cl_=clientes.find(c=>c.id===mp.clienteId); return <Sec icon="📋" title={`Presupuesto Promob — ${cl_?.nombre||mp.cliente||"Sin cliente"}`}/>; })()}

            {/* Datos generales */}
            <div style={card}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
                <FRow label="Cliente">
                  <select style={sel} value={mp.clienteId||""} onChange={e=>{const c=clientes.find(x=>x.id===e.target.value);updMan(mp.id,{clienteId:e.target.value,cliente:c?.nombre||"",telefono:c?.telefono||""});}}>
                    <option value="">Elegir...</option>{clientes.sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||"")).map(c=><option key={c.id} value={c.id}>{c.nombre||"Sin nombre"}</option>)}
                  </select>
                </FRow>
                <FRow label="Fecha"><input type="date" style={inp} value={mp.fecha} onChange={e=>updMan(mp.id,{fecha:e.target.value})}/></FRow>
                <FRow label="Estado"><select style={sel} value={mp.estado} onChange={e=>updMan(mp.id,{estado:e.target.value})}><option>Pendiente</option><option>Aprobado</option><option>Rechazado</option></select></FRow>
              </div>
              {isAdmin && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:10}}>
                <FRow label="Rentabilidad"><select style={sel} value={mp.rentabilidad||30} onChange={e=>updMan(mp.id,{rentabilidad:parseInt(e.target.value)})}>{RENTS.map(r=><option key={r} value={r}>{r}%</option>)}</select></FRow>
                <FRow label="IVA (21%)">
                  <div style={{display:"flex",alignItems:"center",gap:8,height:34,cursor:"pointer"}} onClick={()=>updMan(mp.id,{iva:!mp.iva})}>
                    <div style={{width:38,height:20,borderRadius:10,background:mp.iva?G:"#d5cfc5",position:"relative",transition:".3s"}}><div style={{width:16,height:16,borderRadius:8,background:"#fff",position:"absolute",top:2,left:mp.iva?20:2,transition:".3s",boxShadow:"0 1px 3px rgba(0,0,0,.15)"}}/></div>
                    <span style={{fontSize:13,fontWeight:500}}>{mp.iva?"Sí":"No"}</span>
                  </div>
                </FRow>
                <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={syncPrecios} style={{...btnO,fontSize:10}}>🔄 Actualizar precios base</button></div>
              </div>}
            </div>

            {/* Items por categoría */}
            <Sec icon="📋" title={`Ítems del Catálogo — ${usados} con cantidad`}/>
            {cats.map(cat=>{
              const catItems = allItems.filter(it=>it.cat===cat);
              const catHasQty = catItems.some(it=>(it.cantidad||0)>0);
              return <div key={cat} style={{...card,padding:10,marginBottom:6,border:catHasQty?`2px solid ${G}`:"1px solid #f0ebe3"}}>
                <div style={{fontSize:11,fontWeight:700,color:catHasQty?G:"#8a7d6b",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                  <span>{cat}</span>
                  {catHasQty && <span style={{fontSize:10,color:G}}>{catItems.filter(it=>(it.cantidad||0)>0).length} ítems</span>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280,1fr))",gap:4}}>
                  {catItems.map((it,idx)=>{
                    const hasQ = (it.cantidad||0)>0;
                    const qIdx = allItems.indexOf(it);
                    const mk_ = 1+((mp.rentabilidad||30)/100);
                    return <div key={it.uid} style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 100px 55px 80px":"1fr 55px 80px",gap:4,alignItems:"center",padding:"3px 4px",borderRadius:4,background:hasQ?"#fef9c3":"transparent"}}>
                      <span style={{fontSize:10,fontWeight:hasQ?700:400,color:hasQ?D:"#8a7d6b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={it.descripcion}>{it.descripcion}</span>
                      {isAdmin && <MoneyInput value={it.precio||0} onChange={v=>updItem(it.uid,"precio",v)} style={{...inp,padding:"3px 5px",fontSize:10,textAlign:"right"}}/>}
                      <input type="number" min={0} data-promob-qty={qIdx} style={{...inp,padding:"3px 5px",fontSize:10,textAlign:"center",fontWeight:700,background:hasQ?"#fff":"#faf8f5",border:hasQ?`2px solid ${G}`:"1.5px solid #e0d8cc"}} value={it.cantidad||""} onChange={e=>updItem(it.uid,"cantidad",parseFloat(e.target.value)||0)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();const next=document.querySelector(`[data-promob-qty="${qIdx+1}"]`);if(next){next.focus();next.select();}}}} placeholder="0"/>
                      <span style={{fontSize:10,textAlign:"right",fontWeight:600,color:hasQ?D:"#ccc"}}>{$(it.precio*(it.cantidad||0)*(isAdmin?1:mk_))}</span>
                    </div>;
                  })}
                </div>
              </div>;
            })}

            {/* Extras libres */}
            <Sec icon="➕" title="Ítems Adicionales" right={<button onClick={addExtra} style={btnO}>+ Agregar</button>}/>
            {extras.length>0 && <div style={card}>
              {extras.map((it,i)=>{
                const sub = (it.precio||0)*(it.cantidad||0);
                const mk_ = 1+((mp.rentabilidad||30)/100);
                return <div key={it.uid} style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 110px 55px 90px 30px":"1fr 55px 90px 30px",gap:6,alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f0ebe3"}}>
                  <input style={{...inp,padding:"4px 8px",fontSize:11}} value={it.descripcion} onChange={e=>updExtra(it.uid,"descripcion",e.target.value)} placeholder="Descripción"/>
                  {isAdmin && <MoneyInput value={it.precio||0} onChange={v=>updExtra(it.uid,"precio",v)} style={{...inp,padding:"4px 6px",fontSize:11,textAlign:"right"}}/>}
                  <input type="number" min={0} style={{...inp,padding:"4px 6px",fontSize:11,textAlign:"center"}} value={it.cantidad||""} onChange={e=>updExtra(it.uid,"cantidad",parseFloat(e.target.value)||0)}/>
                  <span style={{fontSize:11,textAlign:"right",fontWeight:600}}>{$(sub*(isAdmin?1:mk_))}</span>
                  <button onClick={()=>rmExtra(it.uid)} style={btnD}>×</button>
                </div>;
              })}
            </div>}

            {/* Notas y Color */}
            <div style={{...card,marginTop:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={lbl}>Color / Materiales</label>
                  <textarea style={{...inp,minHeight:50,resize:"vertical",fontSize:11}} value={mp.colorSpec||""} onChange={e=>updMan(mp.id,{colorSpec:e.target.value})} placeholder="Ej: Interior Roble Santana, Puertas Gris Grafito..."/>
                </div>
                <FRow label="Observaciones"><textarea style={{...inp,minHeight:50,resize:"vertical",fontSize:11}} value={mp.notas||""} onChange={e=>updMan(mp.id,{notas:e.target.value})} placeholder="Notas adicionales..."/></FRow>
              </div>
            </div>

            {/* Envío */}
            <Sec icon="🚚" title="Envío"/>
            <div style={card}>
              {(()=>{
                const cl_=clientes.find(c=>c.id===mp.clienteId);
                const dirCli = cl_?.direccion || "";
                const dirOrigen = precios.direccionOrigen || "Córdoba, Argentina";
                const mapsUrl = dirCli ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(dirOrigen)}&destination=${encodeURIComponent(dirCli)}&travelmode=driving` : "";
                const km = mp.kmEnvio || 0;
                const costoEnvio = km * (precios.precioKm || 0);
                return <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <label style={{fontSize:11,fontWeight:600,color:"#8a7d6b"}}>Km:</label>
                  <input type="number" min={0} value={km||""} onChange={e=>updMan(mp.id,{kmEnvio:parseFloat(e.target.value)||0})} style={{width:70,padding:"4px 6px",borderRadius:5,border:"1px solid #e0d8cc",fontSize:12,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontWeight:700}} placeholder="0"/>
                  {isAdmin && <span style={{fontSize:10,color:"#8a7d6b"}}>× {$(precios.precioKm||0)}/km</span>}
                  {km > 0 && <span style={{fontSize:12,fontWeight:700,color:G}}>= {$(costoEnvio)}</span>}
                  {dirCli && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#3b82f6",textDecoration:"none",padding:"4px 10px",border:"1px solid #3b82f6",borderRadius:6,fontWeight:600}}>📍 Ver ruta en Google Maps</a>}
                  {!dirCli && <span style={{fontSize:10,color:"#dc2626"}}>⚠ Cargá la dirección del cliente</span>}
                </div>;
              })()}
            </div>

            {/* Resumen */}
            <div style={{background:`linear-gradient(135deg,${D},${D2})`,color:"#fff",borderRadius:12,padding:16}}>
              {isAdmin && [
                ["Subtotal Ítems",totItems],
                [`Rentabilidad (${mp.rentabilidad||30}%)`,rent,"#7dd3a0"],
                ...((mp.kmEnvio||0)>0?[["🚚 Envío ("+(mp.kmEnvio||0)+" km)",tenvioMan,"#fbbf24"]]:[]),
                ...(mp.iva?[["IVA (21%)",ivaAmt]]:[]),
              ].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#a09880",fontSize:12}}>{l}</span>
                  <span style={{fontWeight:700,fontSize:14,color:c||"#fff"}}>{c?"+ ":""}{$(v)}</span>
                </div>
              ))}
              {!isAdmin && <div style={{padding:"5px 0"}}>
                {(mp.kmEnvio||0)>0 && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#fbbf24",fontSize:12}}>🚚 Transporte</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#fbbf24"}}>{$(tenvioMan)}</span>
                </div>}
                {mp.iva && <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{color:"#93c5fd",fontSize:12}}>IVA (21%)</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#93c5fd"}}>{$(ivaAmt)}</span>
                </div>}
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 2px",marginTop:4}}>
                <span style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#e8c47c"}}>TOTAL FINAL</span>
                <span style={{fontSize:20,fontWeight:900,fontFamily:"'Playfair Display',serif",color:"#e8c47c"}}>{$(totFinal)}</span>
              </div>
            </div>

            <div style={{textAlign:"center",marginTop:16}}>
              <button onClick={()=>setView("manPrint")} style={{padding:"12px 30px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${D},${D2})`,color:"#e8c47c",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Playfair Display',serif",letterSpacing:.5,boxShadow:"0 4px 15px rgba(26,26,46,.3)"}}>
                📄 Generar Presupuesto para Cliente
              </button>
            </div>
          </>;
        })()}

        {/* ════ PRESUPUESTO PROMOB IMPRIMIBLE ════ */}
        {view==="manPrint" && (()=>{
          const mp = manPres.find(m=>m.id===manId);
          if(!mp) return <div><button onClick={()=>setView("promob")} style={btnO}>← Volver</button><p>No encontrado</p></div>;
          const mk = 1 + ((mp.rentabilidad||0)/100);
          // Only items with quantity > 0
          const usados = [...(mp.items||[]).filter(it=>(it.cantidad||0)>0), ...(mp.extras||[]).filter(it=>(it.cantidad||0)>0 && it.descripcion)];
          const totItems = usados.reduce((s,it)=>s+(it.precio||0)*(it.cantidad||0),0);
          const tenvioP = (mp.kmEnvio||0) * (precios.precioKm||0);
          const totalSinIva = totItems * mk + tenvioP;
          const totalConIva = totalSinIva * 1.21;

          const ps = {fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#333"};
          const hdr = {fontFamily:"'Playfair Display',serif",fontWeight:700};
          const thP = {padding:"8px 10px",background:D,color:"#fff",fontWeight:600,fontSize:10,textAlign:"left",textTransform:"uppercase",letterSpacing:.5};
          const tdP = {padding:"7px 10px",borderBottom:"1px solid #eee"};
          const tdRP = {...tdP,textAlign:"right",fontWeight:600};

          const cl_ = clientes.find(c=>c.id===mp.clienteId);
          const cliNom = cl_?.nombre || mp.cliente || "—";
          const cliTel = cl_?.telefono || mp.telefono || "";
          const cliDir = cl_?.direccion || "";
          const manPdfName = [cliNom, cliTel, mp.fecha||""].filter(Boolean).join(" - ").replace(/[\/\\:*?"<>|]/g,"_");
          return <>
            <div className="no-print" style={{display:"flex",gap:8,marginBottom:16}}>
              <button onClick={()=>setView("promob")} style={btnO}>← Volver</button>
              <button onClick={()=>doPrint(printRef.current, manPdfName)} style={{...btnG,fontSize:13}}>📥 Descargar PDF</button>
            </div>
            <div ref={printRef} style={{background:"#fff",maxWidth:800,margin:"0 auto",padding:40,borderRadius:4,boxShadow:"0 2px 20px rgba(0,0,0,.08)",...ps}}>
              {/* HEADER AMOBLEX */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:16,borderBottom:`3px solid ${G}`}}>
                  <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:36,fontWeight:300,color:"#1a1a2e",letterSpacing:6,textTransform:"uppercase"}}>Amoblex</div>
                  <div style={{textAlign:"right",fontSize:10,color:"#666",lineHeight:1.6}}>
                    <div>Av. Monseñor Pablo Cabrera 2870, Local 6</div>
                    <div>📱 351-703-6419</div>
                    <div>✉ amoblex@gmail.com</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:D}}>PRESUPUESTO</div>
                  <div style={{fontSize:14,fontWeight:700,color:D}}>Fecha: {mp.fecha}</div>
                </div>
              </div>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:12,color:"#888"}}>Cliente</div>
                <div style={{fontSize:16,fontWeight:700,color:D}}>{cliNom}</div>
                {cliTel && <div style={{fontSize:12,color:"#666"}}>Tel: {cliTel}</div>}
                {cliDir && <div style={{fontSize:12,color:"#666"}}>Dir: {cliDir}</div>}
              </div>
              <div style={{marginBottom:24}}>
                <div style={{...hdr,fontSize:14,color:D,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${G}`}}>Detalle</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    <th style={{...thP,width:30}}>#</th>
                    <th style={thP}>Descripción</th>
                    <th style={{...thP,textAlign:"center",width:60}}>Cant.</th>
                    <th style={{...thP,textAlign:"right",width:120}}>Precio Unit.</th>
                    <th style={{...thP,textAlign:"right",width:120}}>Subtotal</th>
                  </tr></thead>
                  <tbody>
                    {usados.map((it,i)=>{
                      const sub = (it.precio||0)*(it.cantidad||0)*mk;
                      return <tr key={i} style={{background:i%2?"#fafaf8":"#fff"}}>
                        <td style={{...tdP,textAlign:"center",color:"#999"}}>{i+1}</td>
                        <td style={{...tdP,fontWeight:500}}>{it.descripcion}</td>
                        <td style={{...tdP,textAlign:"center"}}>{it.cantidad}</td>
                        <td style={tdRP}>{$((it.precio||0)*mk)}</td>
                        <td style={tdRP}>{$(sub)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              {mp.colorSpec && <div style={{marginBottom:12,padding:12,background:"#fef9c3",borderRadius:8,borderLeft:`3px solid ${G}`}}>
                <div style={{fontSize:10,fontWeight:700,color:"#92400e",marginBottom:4}}>🎨 COLOR / MATERIALES</div>
                <div style={{fontSize:11,color:"#555",whiteSpace:"pre-wrap"}}>{mp.colorSpec}</div>
              </div>}
              {mp.notas && <div style={{marginBottom:20,padding:12,background:"#faf8f5",borderRadius:8,borderLeft:`3px solid ${G}`}}>
                <div style={{fontSize:10,fontWeight:700,color:"#8a7d6b",marginBottom:4}}>OBSERVACIONES</div>
                <div style={{fontSize:11,color:"#555",whiteSpace:"pre-wrap"}}>{mp.notas}</div>
              </div>}
              {/* FLETE */}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:"#f0fdf4",borderRadius:8,fontSize:12,marginBottom:12,border:"1px solid #bbf7d0"}}>
                <span style={{fontWeight:700,color:"#16a34a"}}>🚚 Flete e instalación</span>
                <span style={{fontWeight:700,color:"#16a34a"}}>SIN CARGO</span>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
                <div style={{width:280}}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",fontSize:13}}>
                    <span style={{color:"#888"}}>TOTAL (sin IVA)</span>
                    <span style={{fontWeight:700,color:D}}>{$(totalSinIva)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",background:`linear-gradient(135deg,${D},${D2})`,borderRadius:8,marginTop:4}}>
                    <span style={{...hdr,fontSize:15,color:"#e8c47c"}}>TOTAL (IVA inc.)</span>
                    <span style={{...hdr,fontSize:18,color:"#e8c47c"}}>{$(totalConIva)}</span>
                  </div>
                </div>
              </div>
              {/* PIE AMOBLEX */}
              <div style={{marginTop:20}}>
                <div style={{padding:14,background:"#fef9c3",borderRadius:10,border:`1px solid ${G}`,marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#92400e",marginBottom:4}}>📌 CONDICIONES</div>
                  <div style={{fontSize:10,color:"#555",lineHeight:1.6}}>
                    • Presupuesto válido al día de la fecha. Los precios pueden variar sin previo aviso.<br/>
                    • Flete e instalación sin cargo dentro de Córdoba Capital.<br/>
                    • Forma de pago a convenir.
                  </div>
                </div>
                <div style={{paddingTop:12,borderTop:`2px solid ${G}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:18,fontWeight:300,color:D,letterSpacing:4,textTransform:"uppercase"}}>Amoblex</div>
                    <div style={{fontSize:9,color:"#8a7d6b"}}>Muebles a Medida</div>
                  </div>
                  <div style={{textAlign:"right",fontSize:9,color:"#999",lineHeight:1.5}}>
                    <div>Av. Monseñor Pablo Cabrera 2870, Local 6</div>
                    <div>351-703-6419 · amoblex@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
          </>;
        })()}

      </div>
    </div>
  );
}
