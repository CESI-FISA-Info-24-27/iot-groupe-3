import { Request, Response } from "express";
import { sensorHistory } from "./history.controller";

// Formate une date pour le CSV
function formatDateTime(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// REST: GET /export/csv
export function exportCSV(req: Request, res: Response) {
  const hours = parseInt(req.query.hours as string) || 24;
  
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  // Filtrer les données
  const temperatures = sensorHistory.temperature.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  const humidities = sensorHistory.humidity.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  const pressures = sensorHistory.pressure.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  const sounds = sensorHistory.sound.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  const motions = sensorHistory.motion.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  const lights = sensorHistory.light.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  
  // Helper pour arrondir le timestamp à la seconde
  const roundToSecond = (date: Date): string => {
    const d = new Date(date);
    d.setMilliseconds(0);
    return d.toISOString();
  };
  
  // Créer un Map pour fusionner les données par timestamp (arrondi à la seconde)
  const dataMap = new Map<string, any>();
  
  temperatures.forEach(t => {
    const key = roundToSecond(new Date(t.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.temperature = t.value;
  });
  
  humidities.forEach(h => {
    const key = roundToSecond(new Date(h.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.humidity = h.value;
  });
  
  pressures.forEach(p => {
    const key = roundToSecond(new Date(p.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.pressure = p.value;
  });
  
  sounds.forEach(s => {
    const key = roundToSecond(new Date(s.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.sound = s.value;
  });
  
  motions.forEach(m => {
    const key = roundToSecond(new Date(m.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.motion = m.value;
  });
  
  lights.forEach(l => {
    const key = roundToSecond(new Date(l.timestamp));
    if (!dataMap.has(key)) dataMap.set(key, { timestamp: new Date(key) });
    dataMap.get(key)!.light = l.value;
  });
  
  // Trier par timestamp
  const sortedData = Array.from(dataMap.values()).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Générer le CSV
  const headers = [
    'Date et Heure',
    'Température (°C)',
    'Humidité (%)',
    'Pression (hPa)',
    'Son (dB)',
    'Mouvement',
    'Lumière',
  ];
  
  const rows = sortedData.map(item => {
    const dateStr = formatDateTime(item.timestamp);
    const temp = item.temperature !== undefined ? item.temperature.toFixed(1) : '';
    const humidity = item.humidity !== undefined ? item.humidity.toFixed(1) : '';
    const pressure = item.pressure !== undefined ? item.pressure.toFixed(1) : '';
    const sound = item.sound !== undefined ? item.sound.toFixed(1) : '';
    const motion = item.motion !== undefined ? (item.motion ? 'Oui' : 'Non') : '';
    const light = item.light !== undefined ? (item.light ? 'Allumée' : 'Éteinte') : '';
    
    return [dateStr, temp, humidity, pressure, sound, motion, light].join(';');
  });
  
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  
  // Envoyer le CSV
  const filename = `cesiguard_data_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
}
