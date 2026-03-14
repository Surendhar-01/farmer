"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Landmark, CheckCircle2, MapPin } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface Scheme {
  district: string;
  name: string;
  amount: string;
  eligibility: string;
  action: string;
  link: string;
}

const TAMIL_NADU_DISTRICTS = [
  "All",
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Karur",
  "Kanyakumari",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "The Nilgiris",
  "Thiruvallur",
  "Thiruvarur",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvannamalai",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
] as const;

const DISTRICT_ALIASES: Record<string, string> = {
  Trichy: "Tiruchirappalli",
};

function normalizeDistrict(district: string) {
  return DISTRICT_ALIASES[district] ?? district;
}

// Mock API Call that inherently translates the payload to the provided language
const fetchSchemesAPI = async (lang: string): Promise<Scheme[]> => {
  const dictionary: Record<string, Scheme[]> = {
    en: [
      { district: "All", name: "PM-KISAN Samman Nidhi", amount: "₹6,000 / year", eligibility: "All landholding farmers", action: "Apply Now", link: "https://pmkisan.gov.in/" },
      { district: "All", name: "Pradhan Mantri Fasal Bima", amount: "Crop Insurance", eligibility: "Farmers with notified crops", action: "Check Premium", link: "https://pmfby.gov.in/" },
      { district: "Ariyalur", name: "Delta Solar Pump Subsidy", amount: "Up to 70% Subsidy", eligibility: "Ariyalur Delta Farmers", action: "Apply at AED", link: "https://aed.tn.gov.in/" },
      { district: "Chennai", name: "Urban Farming Kit", amount: "50% off Kits", eligibility: "Chennai Terrace Farmers", action: "Apply at TNAU", link: "https://agritech.tnau.ac.in/" },
      { district: "Coimbatore", name: "Drip Irrigation Expansion", amount: "₹10,000 / acre", eligibility: "Coimbatore Region Farmers", action: "View Detail", link: "https://tnhorticulture.tn.gov.in/" },
      { district: "Madurai", name: "Jasmine Grower Support", amount: "Free saplings", eligibility: "Madurai Flower Farmers", action: "Apply Now", link: "https://tnagrisnet.tn.gov.in/" },
      { district: "Trichy", name: "Cauvery Delta Seed Subsidy", amount: "30% off Paddy Seeds", eligibility: "Trichy Paddy Farmers", action: "View Detail", link: "https://tnagrisnet.tn.gov.in/" }
    ],
    ta: [
      { district: "All", name: "பி.எம் கிசான் சம்மான் நிதி", amount: "₹6,000 / வருடம்", eligibility: "அனைத்து விவசாயிகள்", action: "விண்ணப்பிக்க", link: "https://pmkisan.gov.in/" },
      { district: "All", name: "பிரதம மந்திரி பயிர் காப்பீடு", amount: "பயிர் காப்பீடு", eligibility: "பயிர்கள் உள்ள விவசாயிகள்", action: "பிரீமியம் பார்க்க", link: "https://pmfby.gov.in/" },
      { district: "Ariyalur", name: "சூரிய சக்தி பம்பு மானியம்", amount: "70% வரை மானியம்", eligibility: "அரியலூர் டெல்டா விவசாயிகள்", action: "விண்ணப்பிக்கவும்", link: "https://aed.tn.gov.in/" },
      { district: "Chennai", name: "நகர்ப்புற விவசாயக் கருவி", amount: "50% தள்ளுபடி", eligibility: "சென்னை மாடி விவசாயிகள்", action: "விண்ணப்பிக்கவும்", link: "https://agritech.tnau.ac.in/" },
      { district: "Coimbatore", name: "சொட்டு நீர் பாசன விரிவு", amount: "₹10,000 / ஏக்கர்", eligibility: "கோயம்புத்தூர் விவசாயிகள்", action: "விவரம் பார்க்க", link: "https://tnhorticulture.tn.gov.in/" },
      { district: "Madurai", name: "மல்லிகை வளர்ப்போர் ஆதரவு", amount: "இலவச மரக்கன்றுகள்", eligibility: "மதுரை மலர் விவசாயிகள்", action: "விண்ணப்பிக்கவும்", link: "https://tnagrisnet.tn.gov.in/" },
      { district: "Trichy", name: "காவிரி டெல்டா விதை மானியம்", amount: "30% தள்ளுபடி", eligibility: "திருச்சி நெல் விவசாயிகள்", action: "விவரம் பார்க்க", link: "https://tnagrisnet.tn.gov.in/" }
    ],
    hi: [
      { district: "All", name: "पीएम-किसान सम्मान निधि", amount: "₹6,000 / वर्ष", eligibility: "सभी किसान", action: "अभी आवेदन करें", link: "https://pmkisan.gov.in/" },
      { district: "All", name: "प्रधानमंत्री फसल बीमा योजना", amount: "फसल बीमा", eligibility: "फसलों वाले किसान", action: "प्रीमियम जांचें", link: "https://pmfby.gov.in/" },
      { district: "Ariyalur", name: "डेल्टा सौर पंप सब्सिडी", amount: "70% तक सब्सिडी", eligibility: "अरियालुर डेल्टा किसान", action: "आवेदन करें", link: "https://aed.tn.gov.in/" },
      { district: "Chennai", name: "शहरी कृषि किट", amount: "50% की छूट", eligibility: "चेन्नई छत के किसान", action: "आवेदन करें", link: "https://agritech.tnau.ac.in/" },
      { district: "Coimbatore", name: "ड्रिप सिंचाई विस्तार", amount: "₹10,000 / एकड़", eligibility: "कोयंबटूर के किसान", action: "विवरण देखें", link: "https://tnhorticulture.tn.gov.in/" },
      { district: "Madurai", name: "चमेली उत्पादक समर्थन", amount: "मुफ्त पौधे", eligibility: "मदुरै फूल के किसान", action: "आवेदन करें", link: "https://tnagrisnet.tn.gov.in/" },
      { district: "Trichy", name: "कावेरी डेल्टा बीज सब्सिडी", amount: "पैडी के बीजों पर 30% छूट", eligibility: "त्रिची के धान किसान", action: "विवरण देखें", link: "https://tnagrisnet.tn.gov.in/" }
    ]
  };

  // Simulate network delay
  return new Promise<Scheme[]>((resolve) => {
    setTimeout(() => {
      resolve(dictionary[lang] || dictionary["en"]);
    }, 400);
  });
};

export default function GovernmentSchemesPage() {
  const { t, language } = useLanguage();
  const [district, setDistrict] = useState("All");
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loadedLanguage, setLoadedLanguage] = useState("");
  const loading = loadedLanguage !== language;

  const districts = TAMIL_NADU_DISTRICTS;

  // Fetch fully translated schemes from API whenever language changes
  useEffect(() => {
    let isActive = true;

    fetchSchemesAPI(language).then((data) => {
      if (!isActive) return;
      setSchemes(data);
      setLoadedLanguage(language);
    });

    return () => {
      isActive = false;
    };
  }, [language]);

  // Filter schemes by exact district match, plus globally available "All" schemes
  const districtFilteredSchemes =
    district === "All"
      ? schemes
      : schemes.filter((scheme) => {
          const normalizedSchemeDistrict = normalizeDistrict(scheme.district);
          return normalizedSchemeDistrict === "All" || normalizedSchemeDistrict === district;
        });

  const filteredSchemes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return districtFilteredSchemes;
    }

    return districtFilteredSchemes.filter((scheme) =>
      [scheme.name, scheme.eligibility, scheme.amount, normalizeDistrict(scheme.district)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [districtFilteredSchemes, query]);

  const districtSpecificCount = filteredSchemes.filter((scheme) => scheme.district !== "All").length;

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4 min-h-screen bg-gray-50">
      <BackButton />
      
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#4f46e5] rounded-full p-4 mb-4 shadow-sm">
          <Landmark size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {t("schemes") || "Government Schemes"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {t("schemes_desc") || "Find agricultural subsidies"}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        
        {/* District Selector Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-xl mr-4 flex-shrink-0 text-indigo-700">
            <MapPin size={24} />
          </div>
          <div className="w-full">
            <label className="text-sm font-bold text-gray-700 block mb-1">Select Your District</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {districts.map((districtName) => (
                <option key={districtName} value={districtName}>
                  {districtName === "All" ? "Select District..." : districtName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">Search schemes</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by scheme, benefit, or eligibility"
            className="bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Matching schemes</p>
            <p className="mt-2 text-2xl font-bold text-indigo-900">{filteredSchemes.length}</p>
            <p className="text-xs text-indigo-700">After district and search filters</p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">District specific</p>
            <p className="mt-2 text-2xl font-bold text-orange-900">{districtSpecificCount}</p>
            <p className="text-xs text-orange-700">Targeted support schemes</p>
          </div>
        </div>

        {/* Translation Notification Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start w-full shadow-sm mb-4">
          <span className="mr-3 text-xl">🔵</span>
          <p className="text-blue-800 text-sm font-medium">
            Showing <span className="font-bold">{filteredSchemes.length}</span> schemes available in your district. Content successfully translated by API.
          </p>
        </div>

        {/* Schemes List */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          filteredSchemes.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
              
              <div className="flex items-start mb-3">
                <div className="w-full">
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h2>
                  <div className="text-gray-500 text-sm mt-1 flex justify-between">
                    <span>{item.eligibility}</span>
                    {item.district !== "All" && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold">
                        {item.district} Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 text-indigo-800 px-3 py-2 rounded-xl border border-indigo-100 font-bold mb-4 inline-block">
                {item.amount}
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">District:</span> {normalizeDistrict(item.district)}
              </div>

              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer" 
                className="w-full py-3 bg-[#4f46e5] text-white rounded-xl font-bold text-sm shadow-sm transition-colors hover:bg-indigo-700 flex justify-center items-center"
              >
                {item.action}
                <CheckCircle2 size={16} className="ml-2" />
              </a>

            </div>
          ))
        )}
      </div>
    </main>
  );
}
