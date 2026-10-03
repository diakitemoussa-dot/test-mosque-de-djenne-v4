export const CHAPTERS = [
  {
    id: 'ch1',
    name: 'PLACE DU VILLAGE',
    video: 'ch1.mp4',
    duration: 60,
    hotspotsTemporal: [
      { id: 'ch1_1', title: 'Point de vue', yaw: 0, pitch: -5, start: 10, end: 25, image: 'assets/hotspots/ch1_view.jpg', text: 'Description du point de vue principal.' },
      { id: 'ch1_2', title: 'Détail architectural', yaw: 120, pitch: 10, start: 30, end: 45, image: 'assets/hotspots/ch1_detail.jpg', text: 'Détail architectural remarquable.' },
      { id: 'ch1_3', title: 'Ambiance', yaw: -120, pitch: 0, start: 50, end: 60, image: 'assets/hotspots/ch1_ambience.jpg', text: 'Ambiance générale du lieu.' }
    ],
    hotspotsSpatial: [
      { to: 1, yaw: 75, label: 'VERS L\'ALLÉE' },
      { to: 2, yaw: -25, label: 'EXPLORER LA FALAISE' }
    ]
  },
  {
    id: 'ch2',
    name: 'L\'ALLÉE',
    video: 'ch2.mp4',
    duration: 60,
    hotspotsTemporal: [
      { id: 'ch2_1', title: 'Point de vue', yaw: 0, pitch: -5, start: 10, end: 25, image: 'assets/hotspots/ch2_view.jpg', text: 'Description du point de vue principal.' },
      { id: 'ch2_2', title: 'Détail architectural', yaw: 120, pitch: 10, start: 30, end: 45, image: 'assets/hotspots/ch2_detail.jpg', text: 'Détail architectural remarquable.' },
      { id: 'ch2_3', title: 'Ambiance', yaw: -120, pitch: 0, start: 50, end: 60, image: 'assets/hotspots/ch2_ambience.jpg', text: 'Ambiance générale du lieu.' }
    ],
    hotspotsSpatial: [
      { to: 0, yaw: 150, label: 'RETOUR PLACE' },
      { to: 2, yaw: -70, label: 'CONTINUER' },
      { to: 3, yaw: 45, label: 'CHAPITRE 4' }
    ]
  },
  {
    id: 'ch3',
    name: 'LA FALAISE',
    video: 'ch3.mp4',
    duration: 60,
    hotspotsTemporal: [
      { id: 'ch3_1', title: 'Point de vue', yaw: 0, pitch: -5, start: 10, end: 25, image: 'assets/hotspots/ch3_view.jpg', text: 'Description du point de vue principal.' },
      { id: 'ch3_2', title: 'Détail architectural', yaw: 120, pitch: 10, start: 30, end: 45, image: 'assets/hotspots/ch3_detail.jpg', text: 'Détail architectural remarquable.' },
      { id: 'ch3_3', title: 'Ambiance', yaw: -120, pitch: 0, start: 50, end: 60, image: 'assets/hotspots/ch3_ambience.jpg', text: 'Ambiance générale du lieu.' }
    ],
    hotspotsSpatial: [
      { to: 1, yaw: 140, label: 'VERS L\'ALLÉE' },
      { to: 3, yaw: -90, label: 'CHAPITRE 4' }
    ]
  },
  {
    id: 'ch4',
    name: 'CHAPITRE 4',
    video: 'ch4.mp4',
    duration: 60,
    hotspotsTemporal: [
      { id: 'ch4_1', title: 'Point de vue', yaw: 0, pitch: -5, start: 10, end: 25, image: 'assets/hotspots/ch4_view.jpg', text: 'Description du point de vue principal.' },
      { id: 'ch4_2', title: 'Détail architectural', yaw: 120, pitch: 10, start: 30, end: 45, image: 'assets/hotspots/ch4_detail.jpg', text: 'Détail architectural remarquable.' },
      { id: 'ch4_3', title: 'Ambiance', yaw: -120, pitch: 0, start: 50, end: 60, image: 'assets/hotspots/ch4_ambience.jpg', text: 'Ambiance générale du lieu.' }
    ],
    hotspotsSpatial: [
      { to: 0, yaw: 180, label: 'RETOUR PLACE' },
      { to: 1, yaw: 90, label: 'VERS L\'ALLÉE' },
      { to: 2, yaw: 0, label: 'VERS FALAISE' }
    ]
  }
];