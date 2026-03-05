// lib/figma-data.js — Demo data for Figma-ported screens

export const IMAGES = {
  superhero: 'https://images.unsplash.com/photo-1760954185931-40d5b65fbb86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcmhlcm8lMjBtb3ZpZSUyMGFjdGlvbnxlbnwxfHx8fDE3NzI2MjYwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  tech: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NzI2NTA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  politics: 'https://images.unsplash.com/photo-1645976442368-b2d3fd315932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljcyUyMGdvdmVybm1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzI2NDU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  sports: 'https://images.unsplash.com/photo-1663852914605-f5d7f50e7392?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzb2NjZXIlMjBzdGFkaXVtfGVufDF8fHx8MTc3MjYyOTM3NXww&ixlib=rb-4.1.0&q=80&w=1080',
  science: 'https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3MjY4MDYxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  entertainment: 'https://images.unsplash.com/photo-1708961465125-e8aedcd9b0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnRhaW5tZW50JTIwY2VsZWJyaXR5JTIwY29uY2VydHxlbnwxfHx8fDE3NzI3MTcwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  world: 'https://images.unsplash.com/photo-1584714268709-c3dd9c92b378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBuZXdzJTIwd29ybGQlMjBldmVudHN8ZW58MXx8fHwxNzcyNzE3MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  avatarWoman: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzcyNjU1MTMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  avatarMan: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjYzMzgyMnww&ixlib=rb-4.1.0&q=80&w=1080',
  avatarWoman2: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwY2FzdWFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNzE3MDkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

export const categories = ['Toate', 'Politica', 'Tehnologie', 'Sport', 'Stiinta', 'Divertisment'];

export const articles = [
  {
    id: '1',
    title: 'Companiile tech majore anunta un parteneriat AI pentru dezvoltare responsabila',
    source: 'TechDaily',
    category: 'Tehnologie',
    image: IMAGES.tech,
    timeAgo: 'acum 2h',
    likes: 1234,
    comments: 567,
    content: 'Companiile de tehnologie de varf au anuntat un parteneriat inovator menit sa asigure dezvoltarea si implementarea responsabila a inteligentei artificiale. Coalitia include jucatori importanti din Silicon Valley si promite sa stabileasca standarde la nivel de industrie pentru siguranta si etica AI.',
  },
  {
    id: '2',
    title: 'Finala campionatului atrage un numar record de telespectatori',
    source: 'SportsNet',
    category: 'Sport',
    image: IMAGES.sports,
    timeAgo: 'acum 4h',
    likes: 892,
    comments: 234,
    content: 'Finala campionatului a doborat toate recordurile anterioare de audienta, atragand milioane de telespectatori din intreaga lume. Serialul final a tinut publicul cu sufletul la gura cu jocuri dramatice de ultim moment si reveniri neasteptate.',
  },
  {
    id: '3',
    title: 'Noul cadru de politica climatica obtine sprijin international',
    source: 'WorldNews',
    category: 'Politica',
    image: IMAGES.politics,
    timeAgo: 'acum 6h',
    likes: 567,
    comments: 189,
    content: 'Un nou cadru cuprinzator de politica climatica a obtinut sprijin international larg din peste 150 de tari. Acordul stabileste obiective ambitioase pentru reducerea emisiilor de carbon si infiinteaza un fond global pentru adaptarea climatica in tarile in curs de dezvoltare.',
  },
  {
    id: '4',
    title: 'Descoperire revolutionara in domeniul calculului cuantic',
    source: 'ScienceToday',
    category: 'Stiinta',
    image: IMAGES.science,
    timeAgo: 'acum 8h',
    likes: 2341,
    comments: 456,
    content: 'Oamenii de stiinta au realizat o descoperire majora in calculul cuantic, demonstrand cu succes corectarea erorilor la scara mare pentru prima data. Aceasta dezvoltare aduce computerele cuantice practice semnificativ mai aproape de realitate.',
  },
  {
    id: '5',
    title: 'Sezonul premiilor debuteaza cu nominalizari surprinzatoare in toate categoriile',
    source: 'EntertainNow',
    category: 'Divertisment',
    image: IMAGES.entertainment,
    timeAgo: 'acum 3h',
    likes: 1567,
    comments: 789,
    content: 'Industria divertismentului este in fierbere pe masura ce nominalizarile la premii dezvaluie cateva alegeri surpriza in categoriile majore. Filmele independente si productiile de streaming au facut o prezentare puternica.',
  },
  {
    id: '6',
    title: 'Summit-ul global abordeaza criza umanitara in crestere',
    source: 'GlobalReport',
    category: 'Politica',
    image: IMAGES.world,
    timeAgo: 'acum 5h',
    likes: 432,
    comments: 156,
    content: 'Liderii mondiali s-au reunit pentru un summit de urgenta pentru a aborda criza umanitara in crestere care afecteaza milioane de oameni din intreaga lume. Summit-ul urmareste sa coordoneze eforturile internationale de ajutor.',
  },
];

export const comments = [
  {
    id: '1',
    user: 'Maria Ionescu',
    avatar: IMAGES.avatarWoman,
    text: 'Articol foarte interesant! Imi place cum sunt prezentate datele in mod clar si accesibil.',
    timeAgo: 'acum 2h',
    likes: 24,
  },
  {
    id: '2',
    user: 'Andrei Popescu',
    avatar: IMAGES.avatarMan,
    text: 'Multumesc pentru aceasta analiza detaliata. Este exact ceea ce cautam pentru proiectul meu de cercetare.',
    timeAgo: 'acum 3h',
    likes: 18,
  },
  {
    id: '3',
    user: 'Ion Moldovan',
    avatar: IMAGES.avatarMan,
    text: 'Foarte util! Sper sa vedem mai multe astfel de articole pe platforma.',
    timeAgo: 'acum 5h',
    likes: 42,
  },
];

export const trendingArticles = articles.slice(0, 3);
