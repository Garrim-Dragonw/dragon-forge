import { uid } from "./utils.js";

export function createSeedData(){
  const clients = [
    function demoData(){
  const clients=[
    {
      id:uid(), name:"Alessandro B.", goal:"Massa muscolare", code:"ALESS-123", packageCompleted:3, packageTotal:10, nextAppointment:"2026-06-29T18:30", appointmentProposal:null, notes:"Focus panca e upper. Buona aderenza.",
      measurements:[
        {date:"2026-05-30",weight:85.8,height:178,chest:102,waist:88,arm:35.5,leg:58,notes:"Partenza"},
        {date:"2026-06-07",weight:86.2,height:178,chest:102.5,waist:87.5,arm:36,leg:58.5,notes:"Buona risposta"},
        {date:"2026-06-14",weight:86.7,height:178,chest:103.2,waist:87.2,arm:36.4,leg:59,notes:"Carichi in salita"},
        {date:"2026-06-21",weight:87.1,height:178,chest:104,waist:87,arm:36.8,leg:59.4,notes:"Ottimo"}
      ],
      sessions:[
        {date:"2026-06-01",name:"Upper A",adherence:90,exercises:"Panca piana | 4 | 6 | 70 | 7\nRematore bilanciere | 4 | 8 | 60 | 7\nChest press | 3 | 10 | 40 | 8"},
        {date:"2026-06-08",name:"Upper A",adherence:95,exercises:"Panca piana | 4 | 6 | 72.5 | 8\nRematore bilanciere | 4 | 8 | 62.5 | 8\nChest press | 3 | 10 | 42.5 | 8"},
        {date:"2026-06-15",name:"Upper A",adherence:90,exercises:"Panca piana | 4 | 6 | 75 | 8\nRematore bilanciere | 4 | 8 | 65 | 8\nChest press | 3 | 10 | 45 | 8"},
        {date:"2026-06-22",name:"Upper A",adherence:100,exercises:"Panca piana | 4 | 6 | 77.5 | 8\nRematore bilanciere | 4 | 8 | 67.5 | 8\nChest press | 3 | 10 | 47.5 | 8"}
      ]
    },
    {
      id:uid(), name:"Veronica R.", goal:"Ricomposizione", code:"VERO-456", packageCompleted:2, packageTotal:8, nextAppointment:"2026-06-30T12:00", appointmentProposal:null, notes:"Focus tecnica, controllo e dolore lombare nullo.",
      measurements:[
        {date:"2026-05-29",weight:68.4,height:166,chest:91,waist:78,arm:28.5,leg:55,notes:"Partenza"},
        {date:"2026-06-06",weight:67.9,height:166,chest:91,waist:76.8,arm:28.6,leg:55.2,notes:"Meno gonfiore"},
        {date:"2026-06-13",weight:67.3,height:166,chest:90.8,waist:75.9,arm:28.8,leg:55.4,notes:"Bene"},
        {date:"2026-06-20",weight:66.8,height:166,chest:90.5,waist:75.1,arm:29,leg:55.6,notes:"Aderenza alta"}
      ],
      sessions:[
        {date:"2026-06-02",name:"Total Body 1",adherence:85,exercises:"Leg press | 3 | 10 | 80 | 7\nLat machine | 3 | 10 | 32 | 7\nChest press | 3 | 12 | 20 | 7"},
        {date:"2026-06-09",name:"Total Body 1",adherence:90,exercises:"Leg press | 3 | 10 | 85 | 7\nLat machine | 3 | 10 | 34 | 7\nChest press | 3 | 12 | 22 | 7"},
        {date:"2026-06-16",name:"Total Body 1",adherence:95,exercises:"Leg press | 3 | 10 | 90 | 8\nLat machine | 3 | 10 | 36 | 8\nChest press | 3 | 12 | 24 | 8"}
      ]
    },
    {
      id:uid(), name:"Marco F.", goal:"Dimagrimento + forza", code:"MARCO-789", packageCompleted:3, packageTotal:12, nextAppointment:"2026-07-01T19:00", appointmentProposal:null, notes:"Focus squat/pressa e costanza alimentare.",
      measurements:[
        {date:"2026-05-28",weight:104.6,height:183,chest:112,waist:108,arm:38.5,leg:64,notes:"Partenza"},
        {date:"2026-06-05",weight:103.2,height:183,chest:111.5,waist:106.5,arm:38.4,leg:63.8,notes:"Ottimo inizio"},
        {date:"2026-06-12",weight:102.4,height:183,chest:111,waist:105.4,arm:38.2,leg:63.7,notes:"Scende bene"},
        {date:"2026-06-19",weight:101.6,height:183,chest:110.6,waist:104.2,arm:38.2,leg:63.5,notes:"Stabile e motivato"}
      ],
      sessions:[
        {date:"2026-06-03",name:"Lower A",adherence:80,exercises:"Pressa | 4 | 10 | 180 | 7\nLeg extension | 3 | 12 | 45 | 8\nLat machine | 3 | 10 | 45 | 7"},
        {date:"2026-06-10",name:"Lower A",adherence:85,exercises:"Pressa | 4 | 10 | 190 | 7\nLeg extension | 3 | 12 | 47.5 | 8\nLat machine | 3 | 10 | 47.5 | 7"},
        {date:"2026-06-17",name:"Lower A",adherence:90,exercises:"Pressa | 4 | 10 | 200 | 8\nLeg extension | 3 | 12 | 50 | 8\nLat machine | 3 | 10 | 50 | 8"}
      ]
    },
    {
      id:uid(), name:"Adriano Casu.", goal:"Massa muscolare", code:"ADRIANO-CASU", packageCompleted:3, packageTotal:10, nextAppointment:"2026-06-29T18:30", appointmentProposal:null, notes:"Focus panca e upper. Buona aderenza.",
      measurements:[
      ],
      sessions:[        
        {date:"2026-07-04",name:"Giorno A — Esplosività + gambe + upper",adherence:0,exercises:"Split Jump — max esplosività, stop se cala qualità | 3 | 3 per lato | 0 | 90\"\nSquat bilanciere — RIR 2 | 4 | 5 | 0 | 2'30\"-3'\nBulgarian Split Squat — controllato, no cedimento | 3 | 8 per lato | 0 | 90\"-2'\nLeg Curl — fermo 1\" in chiusura | 3 | 10-12 | 0 | 75\"-90\"\nPanca piana bilanciere — RIR 2 | 4 | 6 | 0 | 2'-2'30\"\nLat Machine presa neutra — RIR 1-2 | 3 | 8-10 | 0 | 90\"-2'\nRenegade Row — bacino stabile | 3 | 6-8 per lato | 0 | 90\""},
        {date:"2026-07-04",name:"Giorno B — Catena posteriore + upper + braccia",adherence:0,exercises:"Romanian Deadlift RDL — RIR 2, eccentrica controllata | 4 | 6-8 | 0 | 2'30\"-3'\nLeg Press — RIR 2 | 3 | 8-10 | 0 | 2'\nPush Press — concentrica esplosiva, no cedimento | 4 | 5 | 0 | 2'\nGorilla Row — tronco stabile | 3 | 8-10 per lato | 0 | 90\"-2'\nPanca inclinata manubri — RIR 1-2 | 3 | 8-10 | 0 | 90\"\nFrench Press — superset 6A, discesa controllata | 3 | 10-12 | 0 | nessun recupero\nCurl manubri negativa lenta — superset 6B, eccentrica 3\" | 3 | 8-10 | 0 | 90\" dopo coppia\nPlank classico — glutei e addome contratti | 3 | 30-45\" | 0 | 60\""},
        {date:"2026-07-04",name:"Giorno C — Addominali a casa",adherence:0,exercises:"Reverse Crunch lento — retroversione bacino | 4 | 12-15 | 0 | 45\"-60\"\nCrunch a gambe sollevate — tensione continua | 3 | 15-20 | 0 | 45\"\nSide Plank — corpo in linea, bacino alto | 3 | 30-45\" per lato | 0 | 45\"-60\"\nBear Plank Shoulder Tap — bacino fermo | 3 | 16-20 totali | 0 | 45\"-60\"\nMountain Climber lento — 2\" avanti + 2\" ritorno | 3 | 10-15 per lato | 0 | 45\"-60\""}
      ]
    },
  ];
  return {clients};
}
  ];

  return {
    clients,
    settings: {},
    appointments: [],
    prices: []
  };
}