import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Calendar, MapPin, Clock, Camera, CheckCircle, 
  Settings, Users, Download, Lock, ChevronRight, Menu, X, ArrowLeft
} from 'lucide-react';
import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy 
} from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyAm7yNaPzf6SurRowMVE75rC-NhzR2PcR0",
  authDomain: "weding-21323.firebaseapp.com",
  projectId: "weding-21323",
  storageBucket: "weding-21323.firebasestorage.app",
  messagingSenderId: "138014925917",
  appId: "1:138014925917:web:2b37a51df8b61a823559b4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "weding-21323";

// --- INJECT FONTS & CUSTOM STYLES ---
const style = document.createElement('style');
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
  
  body {
    font-family: 'Noto Sans Sinhala', sans-serif;
    background-color: #fdfbf7;
    color: #333;
    overflow-x: hidden;
  }
  
  .font-serif-eng { font-family: 'Playfair Display', serif; }
  
  .gold-gradient {
    background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .bg-gold-gradient {
    background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728);
  }

  .border-gold { border-color: #d4af37; }
  .text-gold { color: #d4af37; }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #fdfbf7; }
  ::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #b38728; }
  
  /* Floral Pattern Mask */
  .floral-mask {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* Custom Scrollbar for Invitation Card */
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 4px; }

  /* Reveal Animation Utility */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
  }
  .reveal.active {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);


// --- DEFAULT DATA ---
const defaultData = {
  groomName: "චමල්", // Chamal
  brideName: "සඳුනි", // Sanduni
  welcomeText: "අපගේ විවාහ මංගල්‍යයට සාදරයෙන් පිළිගනිමු",
  date: "2026 මැයි 28",
  time: "උදෑසන 9.00 සිට",
  venueName: "Royal Kandyan Hotel",
  venueAddress: "පේරාදෙණිය පාර, මහනුවර",
  venueMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.60563467645!2d80.56214539151525!3d7.294544458316335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae366266498acd3%3A0x411a3818a1e03c35!2sKandy!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk",
  parentsGroom: "රේණුකා සුභාවික්‍රම / නන්දසේන අදිකාරම්",
  parentsBride: "රත්නායක මහත්මිය",
  invitationMessage: "අපගේ දරුවන්ගේ ජීවිතයේ මෙම සුන්දර අවස්ථාවට ආශිර්වාද කිරීම සඳහා ඔබගේ පැමිණීම ගෞරවයෙන් අපේක්ෂා කරමු.",
  timeline: [
    { id: 1, time: "09:15 AM", title: "නැකත් වේලාව", desc: "සුබ මොහොතින් මංගල්‍යය ආරම්භ කිරීම", icon: "Clock" },
    { id: 2, time: "09:45 AM", title: "පොරුව චාරිත්‍ර", desc: "සාම්ප්‍රදායික කන්ද උඩරට චාරිත්‍ර ඉටුකිරීම", icon: "Heart" },
    { id: 3, time: "10:30 AM", title: "මංගල මුදු හුවමාරුව", desc: "අතිනත ගැනීම සහ මුදු හුවමාරුව", icon: "CheckCircle" },
    { id: 4, time: "12:00 PM", title: "දිවා භෝජන සංග්‍රහය", desc: "ආරාධිත අමුත්තන් සඳහා වූ විශේෂ භෝජන සංග්‍රහය", icon: "Users" }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606214174585-fd10f76eb1c2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1000&auto=format&fit=crop"
  ]
};

// --- CUSTOM HOOKS ---
function useIntersectionObserver(options = {}) {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, ...options });

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return setRef;
}

// --- COMPONENTS ---

const DecorativeCorners = () => (
  <>
    {/* Top Left */}
    <div className="absolute top-4 left-4 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-80">
      <svg viewBox="0 0 100 100" className="text-gold fill-current drop-shadow-md">
        <path d="M0,0 L100,0 C100,0 100,50 50,50 C0,50 0,100 0,100 L0,0 Z" opacity="0.3"/>
        <path d="M0,0 L80,0 C80,0 80,40 40,40 C0,40 0,80 0,80 L0,0 Z"/>
        <circle cx="20" cy="20" r="5" fill="#800000" />
      </svg>
    </div>
    {/* Top Right */}
    <div className="absolute top-4 right-4 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-80 rotate-90">
      <svg viewBox="0 0 100 100" className="text-gold fill-current drop-shadow-md">
        <path d="M0,0 L100,0 C100,0 100,50 50,50 C0,50 0,100 0,100 L0,0 Z" opacity="0.3"/>
        <path d="M0,0 L80,0 C80,0 80,40 40,40 C0,40 0,80 0,80 L0,0 Z"/>
        <circle cx="20" cy="20" r="5" fill="#800000" />
      </svg>
    </div>
    {/* Bottom Left */}
    <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-80 -rotate-90">
      <svg viewBox="0 0 100 100" className="text-gold fill-current drop-shadow-md">
        <path d="M0,0 L100,0 C100,0 100,50 50,50 C0,50 0,100 0,100 L0,0 Z" opacity="0.3"/>
        <path d="M0,0 L80,0 C80,0 80,40 40,40 C0,40 0,80 0,80 L0,0 Z"/>
        <circle cx="20" cy="20" r="5" fill="#800000" />
      </svg>
    </div>
    {/* Bottom Right */}
    <div className="absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-80 rotate-180">
      <svg viewBox="0 0 100 100" className="text-gold fill-current drop-shadow-md">
        <path d="M0,0 L100,0 C100,0 100,50 50,50 C0,50 0,100 0,100 L0,0 Z" opacity="0.3"/>
        <path d="M0,0 L80,0 C80,0 80,40 40,40 C0,40 0,80 0,80 L0,0 Z"/>
        <circle cx="20" cy="20" r="5" fill="#800000" />
      </svg>
    </div>
  </>
);

const HeroSection = ({ isOpened, setIsOpened, data }) => {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
      
      {/* The Animated Doors / Curtains */}
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-[1500ms] ease-in-out z-20 flex justify-end overflow-hidden ${isOpened ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="w-[200%] h-full bg-[#fdfbf7] relative">
          <div className="absolute inset-0 floral-mask opacity-40"></div>
          {/* Left Door Details */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-32 bg-gold-gradient rounded-l-full shadow-lg"></div>
          
          <div className="absolute right-4 md:right-1/4 top-1/2 -translate-y-1/2 text-center w-64 text-[#800000]">
             <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=400&auto=format&fit=crop" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gold shadow-xl" alt="Groom" />
             <h2 className="text-3xl font-bold mb-2">{data.groomName}</h2>
          </div>
        </div>
      </div>

      <div 
        className={`absolute top-0 right-0 w-1/2 h-full transition-transform duration-[1500ms] ease-in-out z-20 flex justify-start overflow-hidden ${isOpened ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="w-[200%] h-full bg-[#fdfbf7] relative -left-full">
           <div className="absolute inset-0 floral-mask opacity-40"></div>
           {/* Right Door Details */}
           <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-32 bg-gold-gradient rounded-r-full shadow-lg"></div>

           <div className="absolute left-4 md:left-1/4 top-1/2 -translate-y-1/2 text-center w-64 text-[#800000]">
             <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gold shadow-xl" alt="Bride" />
             <h2 className="text-3xl font-bold mb-2">{data.brideName}</h2>
          </div>
        </div>
      </div>

      {/* Opening Button Overlay */}
      <div className={`absolute z-30 transition-all duration-700 flex flex-col items-center ${isOpened ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 scale-100 delay-1000'}`}>
         <div className="bg-[#fdfbf7] p-8 rounded-full shadow-2xl border-2 border-gold cursor-pointer transform hover:scale-105 transition-transform" onClick={() => setIsOpened(true)}>
            <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center animate-pulse">
               <Heart className="text-white w-8 h-8" />
            </div>
         </div>
         <p className="mt-6 text-xl text-gold font-bold uppercase tracking-widest text-shadow drop-shadow-lg gold-gradient">
            ආරාධනය විවෘත කරන්න
         </p>
      </div>

      {/* Actual Content Revealed Behind Doors */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center bg-[#fdfbf7] transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute inset-0 floral-mask opacity-20"></div>
         <div className="relative p-5 sm:p-10 text-center max-w-2xl w-[92%] sm:w-full mx-auto border-4 border-double border-gold bg-white/90 shadow-2xl rounded-sm m-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DecorativeCorners />
            <h3 className="text-lg sm:text-2xl text-[#800000] mb-4 sm:mb-6 tracking-wide">{data.welcomeText}</h3>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-3 sm:mb-4 gold-gradient pb-2">
              {data.groomName} <span className="text-3xl sm:text-5xl font-serif-eng">&amp;</span> {data.brideName}
            </h1>
            
            <div className="flex items-center justify-center space-x-4 my-6 sm:my-8">
               <div className="h-px bg-gold flex-1 max-w-[100px]"></div>
               <Heart className="text-[#800000] w-6 h-6 flex-shrink-0" />
               <div className="h-px bg-gold flex-1 max-w-[100px]"></div>
            </div>

            <p className="text-base sm:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 px-2 sm:px-4">
              {data.invitationMessage}
            </p>

            <div className="space-y-4 text-gray-800 font-semibold">
              <div className="flex flex-col items-center justify-center">
                 <Calendar className="text-gold w-6 h-6 mb-1" />
                 <p className="text-sm sm:text-base">{data.date}</p>
                 <p className="text-xs sm:text-sm text-gray-500">{data.time}</p>
              </div>
              <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
                 <MapPin className="text-gold w-6 h-6 mb-1" />
                 <p className="text-sm sm:text-base">{data.venueName}</p>
                 <p className="text-xs sm:text-sm text-gray-500">{data.venueAddress}</p>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 pt-4 border-t border-gold/30 flex flex-col sm:flex-row justify-between text-sm text-gray-600 px-2 sm:px-4 gap-4">
               <div className="sm:w-1/2">
                 <p className="text-xs uppercase text-gold mb-1">මනාලයාගේ දෙමාපියන්</p>
                 <p className="leading-tight">{data.parentsGroom}</p>
               </div>
               <div className="sm:w-1/2">
                 <p className="text-xs uppercase text-gold mb-1">මනාලියගේ දෙමාපියන්</p>
                 <p className="leading-tight">{data.parentsBride}</p>
               </div>
            </div>
         </div>
      </div>
      
      {/* Scroll Down Indicator */}
      {isOpened && (
         <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce flex flex-col items-center pointer-events-none">
            <span className="text-gold text-xs sm:text-sm mb-1 sm:mb-2 font-bold tracking-widest bg-[#fdfbf7]/80 px-2 rounded-full">පහළට</span>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-gold to-transparent"></div>
         </div>
      )}
    </div>
  );
};

const TimelineSection = ({ data, setRef }) => {
  return (
    <div className="py-20 bg-white relative overflow-hidden" ref={setRef} id="timeline">
      <div className="absolute left-0 top-0 w-32 h-32 bg-[#800000] rounded-full blur-[100px] opacity-10"></div>
      <div className="absolute right-0 bottom-0 w-32 h-32 bg-gold rounded-full blur-[100px] opacity-10"></div>
      
      <div className="max-w-4xl mx-auto px-4 reveal" ref={setRef}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gold-gradient mb-4">මංගල චාරිත්‍ර පෙළගැස්ම</h2>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gold/30 -translate-x-1/2 rounded-full"></div>

          <div className="space-y-12">
            {data.timeline && data.timeline.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.id} className={`relative flex items-center justify-between md:justify-normal ${isEven ? 'md:flex-row-reverse' : ''} group reveal`} ref={setRef}>
                  
                  {/* Icon Center */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-gold flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform">
                    <div className="w-3 h-3 bg-[#800000] rounded-full"></div>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full pl-16 md:pl-0 md:w-[45%] ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="bg-[#fdfbf7] p-6 rounded-xl shadow-md border border-gold/20 hover:shadow-xl transition-shadow relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-bl-full pointer-events-none"></div>
                       <h3 className="text-2xl font-bold text-[#800000] mb-2">{item.title}</h3>
                       <p className="text-gold font-bold mb-3 flex items-center justify-start md:justify-center md:inline-flex bg-gold/10 px-3 py-1 rounded-full text-sm">
                         <Clock className="w-4 h-4 mr-2" /> {item.time}
                       </p>
                       <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>

                  {/* Empty space for other side on desktop */}
                  <div className="hidden md:block w-[45%]"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const GallerySection = ({ data, setRef }) => {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="py-20 bg-[#fdfbf7] relative" ref={setRef} id="gallery">
      <div className="absolute inset-0 floral-mask opacity-10 pointer-events-none"></div>
      <div className="max-w-6xl mx-auto px-4 reveal" ref={setRef}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#800000] mb-4">මතක සටහන්</h2>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
        </div>

        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {data.gallery && data.gallery.map((img, i) => (
            <div 
              key={i} 
              className="relative overflow-hidden rounded-lg group cursor-pointer shadow-md hover:shadow-2xl transition-all reveal"
              ref={setRef}
              onClick={() => setSelectedImg(img)}
            >
              <img src={img} alt={`Gallery ${i}`} className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-10 h-10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gold p-2" onClick={() => setSelectedImg(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={selectedImg} alt="Enlarged" className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl border-2 border-gold/30" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const LocationSection = ({ data, setRef }) => {
  return (
    <div className="py-20 bg-white" ref={setRef} id="location">
      <div className="max-w-5xl mx-auto px-4 reveal" ref={setRef}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gold-gradient mb-4">මංගල උත්සවය පැවැත්වෙන ස්ථානය</h2>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 bg-[#fdfbf7] p-4 md:p-8 rounded-2xl shadow-xl border border-gold/20">
          <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-inner border-2 border-gold/30 h-[300px] md:h-auto min-h-[300px]">
            <iframe 
              src={data.venueMapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Wedding Venue Location"
            ></iframe>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-[#800000] mb-2">{data.venueName}</h3>
              <p className="text-gray-600 flex items-start">
                <MapPin className="w-5 h-5 text-gold mr-2 mt-1 flex-shrink-0" />
                {data.venueAddress}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-800 mb-2">දිනය සහ වේලාව</h4>
               <p className="text-gray-600 mb-1 flex items-center"><Calendar className="w-4 h-4 mr-2 text-gold"/> {data.date}</p>
               <p className="text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2 text-gold"/> {data.time}</p>
            </div>

            <a 
              href={data.venueMapUrl.match(/src="([^"]+)"/)?.[1] || data.venueMapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-gradient text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Google Maps හරහා විවෘත කරන්න <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const RSVPSection = ({ navigateTo }) => {
  return (
    <div className="py-24 bg-[#1a1a1a] relative overflow-hidden text-center border-t-4 border-gold">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
       
       <div className="relative z-10 max-w-2xl mx-auto px-4">
          <Heart className="w-16 h-16 text-gold mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">අපගේ සතුට බෙදාගන්න</h2>
          <p className="text-xl text-gray-300 mb-10">
             අපගේ විවාහ මංගල්‍යය දා ඔබගේ ආදරණීය සහභාගීත්වය අප බලාපොරොත්තු වෙමු.
          </p>
          <button 
             onClick={() => navigateTo('rsvp')}
             className="px-10 py-5 bg-gold-gradient text-white text-xl rounded-full font-bold shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transform hover:scale-105 transition-all"
          >
             ඔබගේ පැමිණීම තහවුරු කරන්න
          </button>
       </div>
    </div>
  );
};


const RSVPFormPage = ({ navigateTo, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: '1',
    attending: 'yes',
    wishes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("කරුණාකර මොහොතක් රැඳී සිටින්න. (Connecting...)");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const rsvpRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
      await addDoc(rsvpRef, {
        ...formData,
        timestamp: new Date().toISOString(),
        userId: user.uid
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("දෝෂයක් මතු විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
         <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md border-2 border-gold relative overflow-hidden">
            <div className="absolute inset-0 floral-mask opacity-10"></div>
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 relative z-10" />
            <h2 className="text-3xl font-bold text-[#800000] mb-4 relative z-10">ස්තූතියි!</h2>
            <p className="text-gray-600 mb-8 relative z-10">
              අපගේ විවාහ දිනය විශේෂවත් කිරීමට ඔබගේ පැමිණීමට ස්තූතියි. ඔබගේ තහවුරු කිරීම සාර්ථකව යවන ලදි.
            </p>
            <button onClick={() => navigateTo('home')} className="px-8 py-3 bg-gold-gradient text-white rounded-full font-bold relative z-10 hover:shadow-lg transition-all">
              මුල් පිටුවට
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-12 px-4 relative">
       <div className="absolute top-0 left-0 w-full h-64 bg-[#1a1a1a]"></div>
       
       <button onClick={() => navigateTo('home')} className="absolute top-6 left-6 text-white hover:text-gold flex items-center transition-colors z-10">
          <ArrowLeft className="w-5 h-5 mr-2" /> ආපසු
       </button>

       <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 mt-10 border border-gold/20">
          <div className="bg-gold-gradient p-8 text-center text-white relative">
             <div className="absolute inset-0 floral-mask opacity-20"></div>
             <h2 className="text-3xl font-bold relative z-10">පැමිණීම තහවුරු කිරීම (RSVP)</h2>
             <p className="opacity-90 mt-2 relative z-10">කරුණාකර ඔබගේ විස්තර පහතින් ඇතුළත් කරන්න</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">සම්පූර්ණ නම *</label>
              <input 
                type="text" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none bg-gray-50"
                placeholder="ඔබගේ නම"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">දුරකථන අංකය *</label>
                <input 
                  type="tel" required 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none bg-gray-50"
                  placeholder="07X XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">සහභාගී වන සංඛ්‍යාව *</label>
                <select 
                  value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none bg-gray-50"
                >
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">පැමිණීම *</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="yes" checked={formData.attending === 'yes'} onChange={e => setFormData({...formData, attending: e.target.value})} className="w-5 h-5 text-gold focus:ring-gold accent-gold"/>
                  <span className="text-gray-700">පැමිණෙමි (Yes)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="no" checked={formData.attending === 'no'} onChange={e => setFormData({...formData, attending: e.target.value})} className="w-5 h-5 text-gold focus:ring-gold accent-gold"/>
                  <span className="text-gray-700">නොපැමිණෙමි (No)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">සුබපැතුම් / පණිවිඩයක් (විකල්ප)</label>
              <textarea 
                rows="4"
                value={formData.wishes} onChange={e => setFormData({...formData, wishes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none bg-gray-50 resize-none"
                placeholder="යුවළට ඔබගේ සුබපැතුම්..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 bg-gold-gradient text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                 <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'තහවුරු කරන්න'}
            </button>
          </form>
       </div>
    </div>
  );
};


// --- ADMIN PANEL COMPONENTS ---

const AdminLogin = ({ setAdminAuth, navigateTo }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'kandyan123') { // Simple demo password
      setAdminAuth(true);
    } else {
      setError('මුරපදය වැරදියි (Invalid Password)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Lock className="mr-2 text-gold"/> Admin Panel</h2>
            <button onClick={() => navigateTo('home')} className="text-gray-500 hover:text-gray-800"><X /></button>
         </div>
         <p className="text-sm text-gray-500 mb-6">Demo Password: <code className="bg-gray-100 px-2 py-1 rounded">kandyan123</code></p>
         
         <form onSubmit={handleLogin} className="space-y-4">
           {error && <p className="text-red-500 text-sm">{error}</p>}
           <input 
             type="password" 
             value={password} 
             onChange={e => setPassword(e.target.value)} 
             placeholder="මුරපදය (Password)" 
             className="w-full p-3 border rounded focus:ring-2 focus:ring-gold outline-none"
             required
           />
           <button type="submit" className="w-full bg-gray-800 text-white p-3 rounded font-bold hover:bg-gray-900 transition-colors">
             ඇතුල් වන්න (Login)
           </button>
         </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ setAdminAuth, user, navigateTo }) => {
  const [activeTab, setActiveTab] = useState('rsvps');
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const rsvpRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
    const q = query(rsvpRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRsvps(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching RSVPs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Phone', 'Guests', 'Attending', 'Wishes'];
    const rows = rsvps.map(r => [
      new Date(r.timestamp).toLocaleString(),
      `"${r.name}"`,
      r.phone,
      r.guests,
      r.attending,
      `"${(r.wishes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wedding_rsvps.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#1a1a1a] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800 gold-gradient">
          Wedding Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('rsvps')} 
            className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'rsvps' ? 'bg-gold text-white' : 'hover:bg-gray-800'}`}
          >
            <Users className="w-5 h-5 mr-3" /> RSVPs
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'settings' ? 'bg-gold text-white' : 'hover:bg-gray-800'}`}
          >
            <Settings className="w-5 h-5 mr-3" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button onClick={() => navigateTo('home')} className="w-full text-left p-2 text-gray-400 hover:text-white transition-colors">View Site</button>
          <button onClick={() => setAdminAuth(false)} className="w-full text-left p-2 text-red-400 hover:text-red-300 transition-colors">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'rsvps' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">RSVP List</h2>
              <button onClick={exportCSV} className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading data...</div>
              ) : rsvps.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No RSVPs yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                        <th className="p-4">Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Guests</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rsvps.map(rsvp => (
                        <tr key={rsvp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-800">{rsvp.name}</td>
                          <td className="p-4 text-gray-600">{rsvp.phone}</td>
                          <td className="p-4 text-gray-600">{rsvp.guests}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {rsvp.attending === 'yes' ? 'Attending' : 'Not Attending'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={rsvp.wishes}>{rsvp.wishes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Responses</h3>
                 <p className="text-3xl font-bold text-gray-800">{rsvps.length}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
                 <h3 className="text-green-600 text-sm font-bold uppercase mb-2">Total Attending (Guests)</h3>
                 <p className="text-3xl font-bold text-green-700">
                   {rsvps.filter(r => r.attending === 'yes').reduce((acc, curr) => acc + parseInt(curr.guests || 0), 0)}
                 </p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                 <h3 className="text-red-600 text-sm font-bold uppercase mb-2">Not Attending</h3>
                 <p className="text-3xl font-bold text-red-700">{rsvps.filter(r => r.attending === 'no').length}</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Site Settings</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
               <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-700 mb-2">Content Management</h3>
               <p className="text-gray-500 mb-6">In this demo, the frontend content is loaded from local state. In a full production version, this form would map to Firebase Firestore to dynamically update the invitation text, timeline, and gallery images.</p>
               <button className="bg-gray-200 text-gray-600 px-6 py-2 rounded font-bold cursor-not-allowed">Edit Content (Demo Restricted)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'rsvp', 'admin'
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const setRef = useIntersectionObserver();

  // Initialize Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Lock body scroll when invite is closed
  useEffect(() => {
    if (currentView === 'home' && !isInviteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isInviteOpen, currentView]);

  // Routing mechanism
  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // Render Views
  if (currentView === 'admin') {
    if (!isAdminAuth) return <AdminLogin setAdminAuth={setIsAdminAuth} navigateTo={navigateTo} />;
    return <AdminDashboard setAdminAuth={setIsAdminAuth} user={user} navigateTo={navigateTo} />;
  }

  if (currentView === 'rsvp') {
    return <RSVPFormPage navigateTo={navigateTo} user={user} />;
  }

  // Main Home View
  return (
    <div className="w-full bg-[#fdfbf7]">
      <HeroSection isOpened={isInviteOpen} setIsOpened={setIsInviteOpen} data={defaultData} />
      
      {/* Show rest of content only if doors are opened */}
      <div className={`transition-opacity duration-1000 ${isInviteOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <TimelineSection data={defaultData} setRef={setRef} />
        <GallerySection data={defaultData} setRef={setRef} />
        <LocationSection data={defaultData} setRef={setRef} />
        <RSVPSection navigateTo={navigateTo} />
        
        {/* Footer */}
        <footer className="bg-[#111] text-gray-500 py-8 text-center text-sm relative">
          <p>© {new Date().getFullYear()} {defaultData.groomName} & {defaultData.brideName}. All rights reserved.</p>
          <button 
            onClick={() => navigateTo('admin')}
            className="absolute bottom-4 right-4 text-gray-700 hover:text-gold transition-colors"
            title="Admin Login"
          >
            <Lock className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}