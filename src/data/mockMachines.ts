import { MachineData } from '@/types/machine';

export const mockMachines: MachineData[] = [
  // Frente de Colheita 01
  {
    id: 'CS001',
    name: 'Colheitadeira Case 8230',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5505, longitude: -46.6333 },
    speed: 8,
    fuel: 62,
    operationHours: 1890,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Maria Santos',
    area: 'Frente de Colheita 01',
    task: 'Colheita de cana',
    direction: 90,
    telemetry: {
      engineTemp: 92,
      oilPressure: 3.8,
      hydraulicPressure: 165,
      batteryVoltage: 12.4,
      workingWidth: 9.1
    }
  },
  {
    id: 'CS002',
    name: 'Colheitadeira John Deere CH670',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5515, longitude: -46.6343 },
    speed: 6,
    fuel: 78,
    operationHours: 2150,
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    operator: 'Pedro Oliveira',
    area: 'Frente de Colheita 01',
    task: 'Colheita de cana',
    direction: 85,
    telemetry: {
      engineTemp: 89,
      oilPressure: 4.1,
      hydraulicPressure: 170,
      batteryVoltage: 12.6,
      workingWidth: 8.5
    }
  },
  {
    id: 'TR001',
    name: 'Trator Transbordo Fendt 936',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5525, longitude: -46.6353 },
    speed: 12,
    fuel: 85,
    operationHours: 2450,
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    operator: 'João Silva',
    area: 'Frente de Colheita 01',
    task: 'Transporte de cana',
    direction: 45,
    telemetry: {
      engineTemp: 88,
      oilPressure: 4.2,
      hydraulicPressure: 180,
      batteryVoltage: 12.8,
      workingWidth: 6.5
    }
  },
  {
    id: 'TR002',
    name: 'Trator Transbordo New Holland T7.315',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5535, longitude: -46.6363 },
    speed: 10,
    fuel: 72,
    operationHours: 1680,
    lastUpdate: new Date(Date.now() - 3 * 60 * 1000),
    operator: 'Roberto Lima',
    area: 'Frente de Colheita 01',
    task: 'Transporte de cana',
    direction: 50,
    telemetry: {
      engineTemp: 85,
      oilPressure: 4.0,
      hydraulicPressure: 175,
      batteryVoltage: 12.9,
      workingWidth: 4.2
    }
  },
  {
    id: 'TR003',
    name: 'Trator Transbordo Massey Ferguson 8737',
    type: 'transbordo',
    status: 'idle',
    location: { latitude: -23.5545, longitude: -46.6373 },
    speed: 0,
    fuel: 90,
    operationHours: 2890,
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    operator: 'Fernando Souza',
    area: 'Frente de Colheita 01',
    task: 'Aguardando carregamento',
    direction: 315,
    telemetry: {
      engineTemp: 45,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.7,
      workingWidth: 7.8
    }
  },
  {
    id: 'TR004',
    name: 'Trator Transbordo Valtra BH205i',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5555, longitude: -46.6383 },
    speed: 8,
    fuel: 65,
    operationHours: 1950,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Anderson Martins',
    area: 'Frente de Colheita 01',
    task: 'Transporte de cana',
    direction: 40,
    telemetry: {
      engineTemp: 82,
      oilPressure: 3.9,
      hydraulicPressure: 165,
      batteryVoltage: 12.5,
      workingWidth: 5.8
    }
  },
  {
    id: 'CM001',
    name: 'Caminhão Canavieiro Scania R450',
    type: 'caminhao',
    status: 'active',
    location: { latitude: -23.5565, longitude: -46.6393 },
    speed: 25,
    fuel: 45,
    operationHours: 1250,
    lastUpdate: new Date(Date.now() - 4 * 60 * 1000),
    operator: 'Carlos Mendes',
    area: 'Frente de Colheita 01',
    task: 'Transporte para usina',
    direction: 180,
    telemetry: {
      engineTemp: 88,
      oilPressure: 4.5,
      hydraulicPressure: 190,
      batteryVoltage: 12.6,
      workingWidth: 8.0
    }
  },
  {
    id: 'CM002',
    name: 'Caminhão Canavieiro Volvo FH16',
    type: 'caminhao',
    status: 'idle',
    location: { latitude: -23.5575, longitude: -46.6403 },
    speed: 0,
    fuel: 35,
    operationHours: 980,
    lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
    operator: 'Ana Costa',
    area: 'Frente de Colheita 01',
    task: 'Carregamento',
    direction: 270,
    telemetry: {
      engineTemp: 42,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.3,
      workingWidth: 24.0
    }
  },

  // Frente de Colheita 02
  {
    id: 'CS003',
    name: 'Colheitadeira New Holland CR8.90',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5705, longitude: -46.6533 },
    speed: 7,
    fuel: 54,
    operationHours: 2150,
    lastUpdate: new Date(Date.now() - 30 * 1000),
    operator: 'Lucas Ferreira',
    area: 'Frente de Colheita 02',
    task: 'Colheita de cana',
    direction: 225,
    telemetry: {
      engineTemp: 95,
      oilPressure: 3.9,
      hydraulicPressure: 172,
      batteryVoltage: 12.3,
      workingWidth: 10.7
    }
  },
  {
    id: 'CS004',
    name: 'Colheitadeira Claas Lexion 6800',
    type: 'colhedora',
    status: 'maintenance',
    location: { latitude: -23.5715, longitude: -46.6543 },
    speed: 0,
    fuel: 18,
    operationHours: 3200,
    lastUpdate: new Date(Date.now() - 45 * 60 * 1000),
    operator: 'Marcos Silva',
    area: 'Frente de Colheita 02',
    task: 'Manutenção preventiva',
    direction: 0,
    telemetry: {
      engineTemp: 25,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 11.8,
      workingWidth: 9.5
    }
  },
  {
    id: 'TR005',
    name: 'Trator Transbordo Case IH Magnum 380',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5725, longitude: -46.6553 },
    speed: 11,
    fuel: 68,
    operationHours: 1800,
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    operator: 'Rafael Santos',
    area: 'Frente de Colheita 02',
    task: 'Transporte de cana',
    direction: 120,
    telemetry: {
      engineTemp: 90,
      oilPressure: 4.3,
      hydraulicPressure: 185,
      batteryVoltage: 12.7,
      workingWidth: 6.2
    }
  },
  {
    id: 'TR006',
    name: 'Trator Transbordo John Deere 7280R',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5735, longitude: -46.6563 },
    speed: 9,
    fuel: 75,
    operationHours: 2200,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Gabriel Lima',
    area: 'Frente de Colheita 02',
    task: 'Transporte de cana',
    direction: 110,
    telemetry: {
      engineTemp: 87,
      oilPressure: 4.1,
      hydraulicPressure: 178,
      batteryVoltage: 12.8,
      workingWidth: 5.5
    }
  },
  {
    id: 'TR007',
    name: 'Trator Transbordo Deutz-Fahr 9340',
    type: 'transbordo',
    status: 'idle',
    location: { latitude: -23.5745, longitude: -46.6573 },
    speed: 0,
    fuel: 82,
    operationHours: 1650,
    lastUpdate: new Date(Date.now() - 8 * 60 * 1000),
    operator: 'Thiago Costa',
    area: 'Frente de Colheita 02',
    task: 'Aguardando próxima operação',
    direction: 95,
    telemetry: {
      engineTemp: 48,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.6,
      workingWidth: 7.0
    }
  },
  {
    id: 'TR008',
    name: 'Trator Transbordo Kubota M7172',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5755, longitude: -46.6583 },
    speed: 13,
    fuel: 58,
    operationHours: 1420,
    lastUpdate: new Date(Date.now() - 3 * 60 * 1000),
    operator: 'Eduardo Rocha',
    area: 'Frente de Colheita 02',
    task: 'Transporte de cana',
    direction: 130,
    telemetry: {
      engineTemp: 84,
      oilPressure: 3.8,
      hydraulicPressure: 168,
      batteryVoltage: 12.4,
      workingWidth: 4.8
    }
  },
  {
    id: 'CM003',
    name: 'Caminhão Canavieiro Mercedes-Benz Actros',
    type: 'caminhao',
    status: 'active',
    location: { latitude: -23.5765, longitude: -46.6593 },
    speed: 30,
    fuel: 62,
    operationHours: 1850,
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    operator: 'Rodrigo Alves',
    area: 'Frente de Colheita 02',
    task: 'Transporte para usina',
    direction: 200,
    telemetry: {
      engineTemp: 92,
      oilPressure: 4.6,
      hydraulicPressure: 195,
      batteryVoltage: 12.8,
      workingWidth: 9.2
    }
  },
  {
    id: 'CM004',
    name: 'Caminhão Canavieiro DAF XF 530',
    type: 'caminhao',
    status: 'offline',
    location: { latitude: -23.5775, longitude: -46.6603 },
    speed: 0,
    fuel: 28,
    operationHours: 2450,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    operator: 'Bruno Fernandes',
    area: 'Frente de Colheita 02',
    task: 'Desligado',
    direction: 0,
    telemetry: {
      engineTemp: 22,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 11.9,
      workingWidth: 8.5
    }
  },

  // Frente de Colheita 03
  {
    id: 'CS005',
    name: 'Colheitadeira Fendt IDEAL 9T',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5905, longitude: -46.6733 },
    speed: 9,
    fuel: 71,
    operationHours: 1650,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Leonardo Dias',
    area: 'Frente de Colheita 03',
    task: 'Colheita de cana',
    direction: 300,
    telemetry: {
      engineTemp: 91,
      oilPressure: 4.0,
      hydraulicPressure: 175,
      batteryVoltage: 12.5,
      workingWidth: 11.2
    }
  },
  {
    id: 'CS006',
    name: 'Colheitadeira AGCO Ideal 8T',
    type: 'colhedora',
    status: 'idle',
    location: { latitude: -23.5915, longitude: -46.6743 },
    speed: 0,
    fuel: 39,
    operationHours: 2750,
    lastUpdate: new Date(Date.now() - 12 * 60 * 1000),
    operator: 'Vinicius Prado',
    area: 'Frente de Colheita 03',
    task: 'Aguardando abastecimento',
    direction: 285,
    telemetry: {
      engineTemp: 35,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.2,
      workingWidth: 10.0
    }
  },
  {
    id: 'TR009',
    name: 'Trator Transbordo McCormick X8.680',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5925, longitude: -46.6753 },
    speed: 14,
    fuel: 77,
    operationHours: 1280,
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    operator: 'Fábio Moreira',
    area: 'Frente de Colheita 03',
    task: 'Transporte de cana',
    direction: 320,
    telemetry: {
      engineTemp: 86,
      oilPressure: 4.2,
      hydraulicPressure: 182,
      batteryVoltage: 12.9,
      workingWidth: 6.8
    }
  },
  {
    id: 'TR010',
    name: 'Trator Transbordo Landini 7-230',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5935, longitude: -46.6763 },
    speed: 16,
    fuel: 84,
    operationHours: 1950,
    lastUpdate: new Date(Date.now() - 30 * 1000),
    operator: 'Renato Barbosa',
    area: 'Frente de Colheita 03',
    task: 'Transporte de cana',
    direction: 310,
    telemetry: {
      engineTemp: 89,
      oilPressure: 4.4,
      hydraulicPressure: 188,
      batteryVoltage: 13.0,
      workingWidth: 5.2
    }
  },
  {
    id: 'TR011',
    name: 'Trator Transbordo Steyr 6300 Terrus',
    type: 'transbordo',
    status: 'maintenance',
    location: { latitude: -23.5945, longitude: -46.6773 },
    speed: 0,
    fuel: 46,
    operationHours: 3100,
    lastUpdate: new Date(Date.now() - 60 * 60 * 1000),
    operator: 'Gustavo Nunes',
    area: 'Frente de Colheita 03',
    task: 'Manutenção corretiva',
    direction: 0,
    telemetry: {
      engineTemp: 28,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 11.5,
      workingWidth: 7.5
    }
  },
  {
    id: 'TR012',
    name: 'Trator Transbordo Same Virtus 120',
    type: 'transbordo',
    status: 'active',
    location: { latitude: -23.5955, longitude: -46.6783 },
    speed: 11,
    fuel: 63,
    operationHours: 1750,
    lastUpdate: new Date(Date.now() - 4 * 60 * 1000),
    operator: 'Diego Campos',
    area: 'Frente de Colheita 03',
    task: 'Transporte de cana',
    direction: 295,
    telemetry: {
      engineTemp: 83,
      oilPressure: 3.7,
      hydraulicPressure: 162,
      batteryVoltage: 12.6,
      workingWidth: 4.5
    }
  },
  {
    id: 'CM005',
    name: 'Caminhão Canavieiro Iveco Stralis',
    type: 'caminhao',
    status: 'active',
    location: { latitude: -23.5965, longitude: -46.6793 },
    speed: 28,
    fuel: 55,
    operationHours: 1380,
    lastUpdate: new Date(Date.now() - 6 * 60 * 1000),
    operator: 'Alexandre Reis',
    area: 'Frente de Colheita 03',
    task: 'Transporte para usina',
    direction: 220,
    telemetry: {
      engineTemp: 94,
      oilPressure: 4.7,
      hydraulicPressure: 200,
      batteryVoltage: 12.9,
      workingWidth: 8.8
    }
  },
  {
    id: 'CM006',
    name: 'Caminhão Canavieiro MAN TGX 29.540',
    type: 'caminhao',
    status: 'idle',
    location: { latitude: -23.5975, longitude: -46.6803 },
    speed: 0,
    fuel: 41,
    operationHours: 2180,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    operator: 'Júlio César',
    area: 'Frente de Colheita 03',
    task: 'Carregamento',
    direction: 240,
    telemetry: {
      engineTemp: 40,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.1,
      workingWidth: 9.5
    }
  },
  // Máquinas de teste para visualizar todos os estados de cores
  {
    id: 'TEST001',
    name: 'Colheitadeira Teste - Verde (Trabalhando)',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5600, longitude: -46.6400 },
    speed: 7,
    fuel: 65,
    operationHours: 1500,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Teste Verde',
    area: 'Área de Teste',
    task: 'Teste de status verde',
    direction: 0,
    telemetry: {
      engineTemp: 90,
      oilPressure: 4.0,
      hydraulicPressure: 170,
      batteryVoltage: 12.5,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: false,
      transmissionReason: 'NORMAL',
      flag: {
        working: true,
        dislocating: false,
        maneuvering: false,
        idling: false,
        ignition: true
      },
      gps: {
        heading: 45
      }
    }
  },
  {
    id: 'TEST002',
    name: 'Colheitadeira Teste - Azul (Deslocando)',
    type: 'colhedora',
    status: 'active',
    location: { latitude: -23.5610, longitude: -46.6410 },
    speed: 15,
    fuel: 70,
    operationHours: 1600,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    operator: 'Teste Azul',
    area: 'Área de Teste',
    task: 'Teste de status azul',
    direction: 0,
    telemetry: {
      engineTemp: 85,
      oilPressure: 3.9,
      hydraulicPressure: 165,
      batteryVoltage: 12.6,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: false,
      transmissionReason: 'NORMAL',
      flag: {
        working: false,
        dislocating: true,
        maneuvering: false,
        idling: false,
        ignition: true
      },
      gps: {
        heading: 135
      }
    }
  },
  {
    id: 'TEST003',
    name: 'Colheitadeira Teste - Amarelo (Manobra)',
    type: 'colhedora',
    status: 'idle',
    location: { latitude: -23.5620, longitude: -46.6420 },
    speed: 3,
    fuel: 55,
    operationHours: 1700,
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    operator: 'Teste Amarelo',
    area: 'Área de Teste',
    task: 'Teste de status amarelo',
    direction: 0,
    telemetry: {
      engineTemp: 88,
      oilPressure: 4.1,
      hydraulicPressure: 168,
      batteryVoltage: 12.4,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: false,
      transmissionReason: 'NORMAL',
      flag: {
        working: false,
        dislocating: false,
        maneuvering: true,
        idling: false,
        ignition: true
      },
      gps: {
        heading: 225
      }
    }
  },
  {
    id: 'TEST004',
    name: 'Colheitadeira Teste - Vermelho (Parado)',
    type: 'colhedora',
    status: 'idle',
    location: { latitude: -23.5630, longitude: -46.6430 },
    speed: 0,
    fuel: 45,
    operationHours: 1800,
    lastUpdate: new Date(Date.now() - 3 * 60 * 1000),
    operator: 'Teste Vermelho',
    area: 'Área de Teste',
    task: 'Teste de status vermelho',
    direction: 0,
    telemetry: {
      engineTemp: 75,
      oilPressure: 3.5,
      hydraulicPressure: 150,
      batteryVoltage: 12.3,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: false,
      transmissionReason: 'NORMAL',
      flag: {
        working: false,
        dislocating: false,
        maneuvering: false,
        idling: true,
        ignition: true
      },
      gps: {
        heading: 315
      }
    }
  },
  {
    id: 'TEST005',
    name: 'Colheitadeira Teste - Vermelho (Parado Desligado)',
    type: 'colhedora',
    status: 'offline',
    location: { latitude: -23.5640, longitude: -46.6440 },
    speed: 0,
    fuel: 80,
    operationHours: 1900,
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    operator: 'Teste Vermelho Desligado',
    area: 'Área de Teste',
    task: 'Teste de status vermelho desligado',
    direction: 0,
    telemetry: {
      engineTemp: 40,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.2,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: false,
      transmissionReason: 'NORMAL',
      flag: {
        working: false,
        dislocating: false,
        maneuvering: false,
        idling: false,
        ignition: false
      },
      gps: {
        heading: 0
      }
    }
  },
  {
    id: 'TEST006',
    name: 'Colheitadeira Teste - Cinza (Sem Sinal)',
    type: 'colhedora',
    status: 'offline',
    location: { latitude: -23.5650, longitude: -46.6450 },
    speed: 0,
    fuel: 30,
    operationHours: 2000,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    operator: 'Teste Cinza',
    area: 'Área de Teste',
    task: 'Teste de status cinza',
    direction: 0,
    telemetry: {
      engineTemp: 45,
      oilPressure: 0,
      hydraulicPressure: 0,
      batteryVoltage: 12.0,
      workingWidth: 9.0
    },
    deviceMessage: {
      hasLostConnection: true,
      transmissionReason: 'GALILEO_HEAD_PACK_EVENT',
      flag: {
        working: false,
        dislocating: false,
        maneuvering: false,
        idling: false,
        ignition: false
      },
      gps: {
        heading: 90
      }
    }
  }
];