'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'; // MODIFIÉ: Ajout de useCallback
import { motion } from 'framer-motion';
// MODIFIÉ: Import de createClient (client-side)
import { createClient } from '@supabase/supabase-js';
import { Bar, Line } from 'react-chartjs-2';
import { useUser } from '@clerk/nextjs';
import { FaChartBar, FaCalendarAlt, FaTrophy, FaTable, FaDownload, FaSearch, FaEuroSign, FaHashtag, FaChartPie } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
// MODIFIÉ: Initialisation du client Supabase (client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface profil utilisateur connecté
interface UserProfile {
  full_name: string;
  role: string;
}

interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
}

export default function AdminDonationsPage() {
  const defaultAvatar = "/favicon.svg";
  // MODIFIÉ: 'setAvatarUrl' est retiré (inutilisé)
  const [avatarUrl, ] = useState<string | null>(null);
  // MODIFIÉ: 'userProfile' est retiré (inutilisé)
  const [userProfile, ] = useState<UserProfile | null>(null);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Chargement asynchrone pour stats/cartes/graphes
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  // Ajout tri interactif
  const [sortConfig, setSortConfig] = useState<{ key: keyof Donation, direction: 'asc' | 'desc' } | null>(null);
  // Modal de détails
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  // Multi-critères filtres
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const { user } = useUser();
  // Pagination dynamique (infinite scroll)
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    // MODIFIÉ: Correction du warning react-hooks/exhaustive-deps
    const currentLoaderRef = loaderRef.current;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { threshold: 1 }
    );

    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, []); // Ce hook ne dépend que de lui-même (se lance au montage)

  // MODIFIÉ: Ajout de 'user' aux dépendances
  useEffect(() => {
    console.log('User:', user);
    async function fetchDonations() {
      // Note: Idéalement, cet appel devrait être sécurisé par RLS (Row Level Security)
      // ou passer par une API route qui vérifie le rôle admin.
      const { data: donationsData, error } = await supabase.from('admin_donations').select('*');
      if (error) console.error('Erreur Supabase :', error);
      else setDonations(donationsData as Donation[]);
      setLoading(false);
    }

    async function fetchUserProfile() {
      if (user) { // S'assurer que 'user' existe
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        if (profileData) {
          // setUserProfile(profileData); // 'setUserProfile' est inutilisé
          console.log(profileData); // Gardé pour le débogage
        }
      }
    }

    fetchDonations();
    fetchUserProfile();
    // Ajout simulation latence (pour stats/cartes/graphes)
    setTimeout(() => {
      setIsLoadingStats(false);
    }, 1000);
  }, [user]); // 'user' est ajouté comme dépendance

  const filteredDonations = useMemo(() => {
    // MODIFIÉ: 'let' -> 'const'
    const filtered = donations
      .filter((don) => {
// ...
// ... existing code ...
// ...
        return matchesSearch && matchesMonth && matchesStatus && matchesCurrency && matchesMinAmount;
      });
    if (sortConfig) {
// ...
// ... existing code ...
// ...
      });
    } else {
      // Default sort by date desc si pas de tri actif
// ...
// ... existing code ...
// ...
    }
    return filtered;
  }, [donations, debouncedSearch, selectedMonth, sortConfig, filterStatus, filterCurrency, minAmount]);

  // Debounce effect for search
// ...
// ... existing code ...
// ...
  }, [search]);

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
// ...
// ... existing code ...
// ...
        }
      }]
    };
  }, [filteredDonations]);

  const monthlyCountData = useMemo(() => {
// ...
// ... existing code ...
// ...
        }
      }]
    };
  }, [filteredDonations]);

  const topDonors = useMemo(() => {
// ...
// ... existing code ...
// ...
    return [...donorMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [donations]);

  // MODIFIÉ: Utilisation de useCallback pour les fonctions d'export
  const exportCSV = useCallback(() => {
    const headers = ['Nom', 'Email', 'Montant', 'Devise', 'Statut', 'Date'];
// ...
// ... existing code ...
// ...
    document.body.removeChild(link);
    alert('✅ Export CSV terminé avec succès');
  }, [donations]); // Dépend de 'donations'

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
// ...
// ... existing code ...
// ...
    doc.save('donations.pdf');
  }, [donations]); // Dépend de 'donations'

  return (
    <div className={`flex min-h-screen flex-col ${darkMode ? 'bg-gray-950 text-white' : 'bg-[#f4f6fa] text-gray-900'}`}>
// ...
// ... existing code ...
// ...
            className="text-white text-lg"
            title="Notifications à venir"
          >
// ...
// ... existing code ...
// ...
            <span className="text-xs text-gray-400">
              { user?.publicMetadata?.role || 'Super Admin'}
            </span>
          </div>
          {/* MODIFIÉ: Utilisation du composant Image de Next.js */}
          <Image
            src={avatarUrl || defaultAvatar}
            alt="Admin"
// ...
// ... existing code ...
// ...
              className="px-4 py-2 bg-gradient-to-tr from-fuchsia-500 to-orange-400 hover:opacity-90 text-white font-semibold rounded flex items-center justify-center"
            >
              <FaDownload className="inline mr-2" /> Exporter CSV
            </motion.button>
            <motion.button
// ...
// ... existing code ...
// ...
                <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
                <ul className="space-y-2">
                  {topDonors.map((donor, index) => (
                    <li key={index} className={`flex justify-between border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} pb-1`}>
                      <div className="flex items-center gap-2">
                        {/* MODIFIÉ: <img> -> <Image> */}
                        <Image src={`https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}`} width={24} height={24} className="w-6 h-6 rounded-full transition-all duration-300 ease-in-out" alt={donor.name} />
                        <span>{donor.name}</span>
                      </div>
                      <span className="font-semibold text-lime-400">€ {donor.total.toFixed(2)}</span>
// ...
// ... existing code ...
// ...
