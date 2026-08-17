"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sprout,
  Leaf,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Upload,
  AlertCircle,
  RefreshCw,
  Layers,
  CheckCircle,
  MapPin,
  Thermometer,
  CloudRain,
  Wind,
  FileText,
  Database,
  ShieldAlert,
  BookOpen,
  Tractor,
  Droplets,
  Info,
  Calendar,
  Activity,
  Layers3,
  UserCheck,
  ShieldCheck,
  Download,
  Cpu
} from "lucide-react";

import PredictionForm from "../components/PredictionForm";
import PredictionCard from "../components/PredictionCard";
import WeatherCard from "../components/WeatherCard";
import SoilCard from "../components/SoilCard";
import { DashboardCharts } from "../components/DashboardCharts";

const API_BASE = "http://localhost:8000/api/v1";

export default function Home() {
  // Authentication & Session state
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState("Farmer");

  // App active view tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sysStatus, setSysStatus] = useState({ backend: "Connecting", db: "Checking" });

  // Data collections state
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "", address: "", experience_years: 0 });
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [soils, setSoils] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [historical, setHistorical] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Admin state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Notification banners
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form input states
  // Profile Form
  const [profName, setProfName] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profAddress, setProfAddress] = useState("");
  const [profExp, setProfExp] = useState(0);

  // Farm Form
  const [editingFarmId, setEditingFarmId] = useState<number | null>(null);
  const [farmName, setFarmName] = useState("");
  const [farmLat, setFarmLat] = useState("");
  const [farmLng, setFarmLng] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmSoil, setFarmSoil] = useState("Loamy");
  const [farmIrrig, setFarmIrrig] = useState("Drip");
  const [farmCrops, setFarmCrops] = useState("");

  // Crop Form
  const [editingCropId, setEditingCropId] = useState<number | null>(null);
  const [cropFarmId, setCropFarmId] = useState("");
  const [cropName, setCropName] = useState("");
  const [cropSeason, setCropSeason] = useState("Kharif");
  const [cropArea, setCropArea] = useState("");
  const [cropProd, setCropProd] = useState("");
  const [cropRain, setCropRain] = useState("");
  const [cropTemp, setCropTemp] = useState("");
  const [cropFert, setCropFert] = useState("");
  const [cropPrev, setCropPrev] = useState("");

  // Soil Form
  const [editingSoilId, setEditingSoilId] = useState<number | null>(null);
  const [soilFarmId, setSoilFarmId] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [soilN, setSoilN] = useState("");
  const [soilP, setSoilP] = useState("");
  const [soilK, setSoilK] = useState("");
  const [soilOrganic, setSoilOrganic] = useState("");
  const [soilFertility, setSoilFertility] = useState("Medium");

  // Weather Form
  const [editingWeatherId, setEditingWeatherId] = useState<number | null>(null);
  const [weatherFarmId, setWeatherFarmId] = useState("");
  const [weatherRain, setWeatherRain] = useState("");
  const [weatherTemp, setWeatherTemp] = useState("");
  const [weatherHumid, setWeatherHumid] = useState("");
  const [weatherCondition, setWeatherCondition] = useState("Sunny");

  // Historical Form
  const [editingHistId, setEditingHistId] = useState<number | null>(null);
  const [histFarmId, setHistFarmId] = useState("");
  const [histYear, setHistYear] = useState("");
  const [histCrop, setHistCrop] = useState("");
  const [histYield, setHistYield] = useState("");
  const [histRain, setHistRain] = useState("");
  const [histTemp, setHistTemp] = useState("");
  const [histNotes, setHistNotes] = useState("");

  // CSV upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [preprocessDetails, setPreprocessDetails] = useState<any>(null);

  // Yield prediction state
  const [predictionLogs, setPredictionLogs] = useState<any[]>([]);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Initialize Auth session
  useEffect(() => {
    const storedToken = localStorage.getItem("yieldsense_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setSysStatus({ backend: "Disconnected", db: "Disconnected" });
    }
  }, []);

  // Check system health periodically
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch application data when authenticated
  useEffect(() => {
    if (token && currentUser) {
      loadAllData();
    }
  }, [token, currentUser]);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setSysStatus({ backend: "Connected", db: "Connected" });
      } else {
        setSysStatus({ backend: "Error", db: "Error" });
      }
    } catch (e) {
      setSysStatus({ backend: "Offline", db: "Offline" });
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 7000);
  };

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        checkHealth();
      } else {
        handleLogout();
      }
    } catch (e) {
      showError("Authentication verification failed. Running in offline/cached mode.");
    }
  };

  const loadAllData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load Profile
      const profRes = await fetch(`${API_BASE}/profile`, { headers });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setProfName(profData.full_name || "");
        setProfPhone(profData.phone || "");
        setProfAddress(profData.address || "");
        setProfExp(profData.experience_years || 0);
      }

      // Load Farms
      const farmsRes = await fetch(`${API_BASE}/farms`, { headers });
      const farmsData = farmsRes.ok ? await farmsRes.json() : [];
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setCropFarmId(farmsData[0].id.toString());
        setSoilFarmId(farmsData[0].id.toString());
        setWeatherFarmId(farmsData[0].id.toString());
        setHistFarmId(farmsData[0].id.toString());
      }

      // Load Crops
      const cropsRes = await fetch(`${API_BASE}/crops`, { headers });
      const cropsData = cropsRes.ok ? await cropsRes.json() : [];
      setCrops(cropsData);

      // Load Soils
      const soilsRes = await fetch(`${API_BASE}/soils`, { headers });
      const soilsData = soilsRes.ok ? await soilsRes.json() : [];
      setSoils(soilsData);

      // Load Weather
      const weatherRes = await fetch(`${API_BASE}/weather`, { headers });
      const weatherData = weatherRes.ok ? await weatherRes.json() : [];
      setWeather(weatherData);

      // Load Historical Records
      const histRes = await fetch(`${API_BASE}/historical`, { headers });
      const histData = histRes.ok ? await histRes.json() : [];
      setHistorical(histData);

      // Load Datasets
      const datasetsRes = await fetch(`${API_BASE}/datasets`, { headers });
      const datasetsData = datasetsRes.ok ? await datasetsRes.json() : [];
      setDatasets(datasetsData);

      // Load Prediction Logs
      const predLogsRes = await fetch(`${API_BASE}/reports/predictions`, { headers });
      const predLogsData = predLogsRes.ok ? await predLogsRes.json() : [];
      setPredictionLogs(predLogsData);

      // Populate activity logs
      const activities: any[] = [];
      predLogsData.slice(0, 3).forEach((p: any) => {
        activities.push({
          type: "Prediction",
          title: `Yield forecast: ${p.crop_name}`,
          desc: `Predicted: ${(p.predicted_yield ?? 0).toLocaleString()} kg/ha (Conf: ${p.confidence_score ?? 0}%)`,
          time: new Date(p.created_at || Date.now()).toLocaleDateString(),
        });
      });
      farmsData.slice(0, 3).forEach((f: any) => {
        activities.push({
          type: "Farm",
          title: `New Farm Registered: ${f.farm_name}`,
          desc: `${f.farm_size} hectares in coordinates (${f.latitude}, ${f.longitude})`,
          time: new Date(f.created_at || Date.now()).toLocaleDateString(),
        });
      });
      cropsData.slice(0, 3).forEach((c: any) => {
        activities.push({
          type: "Crop",
          title: `Crop cultivation logged: ${c.crop_name}`,
          desc: `Season: ${c.season}, Area: ${c.area_cultivated} ha`,
          time: new Date(c.created_at || Date.now()).toLocaleDateString(),
        });
      });
      soilsData.slice(0, 3).forEach((s: any) => {
        activities.push({
          type: "Soil",
          title: `Soil analytics input for Farm ID ${s.farm_id}`,
          desc: `pH: ${s.ph_value}, Nitrogen: ${s.nitrogen || 'N/A'}, Fertility: ${s.fertility_level || 'N/A'}`,
          time: new Date(s.created_at || Date.now()).toLocaleDateString(),
        });
      });
      setRecentActivities(activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5));

      // Load Admin user list
      if (currentUser?.role === "Admin") {
        const adminRes = await fetch(`${API_BASE}/admin/users`, { headers });
        if (adminRes.ok) {
          setAdminUsers(await adminRes.json());
        }
      }
    } catch (e) {
      showError("Error loading application records from backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showError("Please fill out all email and password fields");
      return;
    }
    if (authPassword.length < 8 && authView === "register") {
      showError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = authView === "register" ? "register" : "login";
      const payload: any = { email: authEmail, password: authPassword };
      if (authView === "register") payload.role = authRole;

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("yieldsense_token", data.access_token);
        setToken(data.access_token);
        showSuccess(`Authenticated successfully as ${data.role}`);
        fetchCurrentUser(data.access_token);
      } else {
        showError(data.detail || "Authentication request failed");
      }
    } catch (e) {
      showError("Connection refused by the backend API server. Verify it is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("yieldsense_token");
    setToken(null);
    setCurrentUser(null);
    setFarms([]);
    setCrops([]);
    setSoils([]);
    setWeather([]);
    setDatasets([]);
    setAdminUsers([]);
    setActiveTab("dashboard");
    showSuccess("Logged out successfully");
  };

  // Profile Save
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profName,
          phone: profPhone,
          address: profAddress,
          experience_years: profExp,
        }),
      });

      if (res.ok) {
        showSuccess("Farmer profile updated successfully");
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to update profile details");
      }
    } catch (e) {
      showError("Error connecting to server profile endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  // Farm CRUD
  const saveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmLat || !farmLng || !farmSize) {
      showError("Please complete all required farm information fields");
      return;
    }
    setIsLoading(true);
    try {
      const url = editingFarmId ? `${API_BASE}/farms/${editingFarmId}` : `${API_BASE}/farms`;
      const method = editingFarmId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_name: farmName,
          latitude: parseFloat(farmLat),
          longitude: parseFloat(farmLng),
          farm_size: parseFloat(farmSize),
          soil_type: farmSoil,
          irrigation_type: farmIrrig,
          crops_grown: farmCrops,
        }),
      });

      if (res.ok) {
        showSuccess(editingFarmId ? "Farm details updated" : "New farm profile registered");
        setFarmName("");
        setFarmLat("");
        setFarmLng("");
        setFarmSize("");
        setFarmSoil("Loamy");
        setFarmIrrig("Drip");
        setFarmCrops("");
        setEditingFarmId(null);
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to save farm details");
      }
    } catch (e) {
      showError("Network error saving farm.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFarm = async (id: number) => {
    if (!confirm("Are you sure you want to delete this farm? This will remove all associated crops and soil records.")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/farms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Farm removed successfully");
        loadAllData();
      } else {
        showError("Failed to delete farm");
      }
    } catch (e) {
      showError("Network error deleting farm.");
    } finally {
      setIsLoading(false);
    }
  };

  // Crop Record CRUD
  const saveCropRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropFarmId || !cropName || !cropArea) {
      showError("Farm selection, crop name, and area are required");
      return;
    }
    setIsLoading(true);
    try {
      const url = editingCropId ? `${API_BASE}/crops/${editingCropId}` : `${API_BASE}/crops`;
      const method = editingCropId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_id: parseInt(cropFarmId),
          crop_name: cropName,
          season: cropSeason,
          area_cultivated: parseFloat(cropArea),
          production_amount: cropProd ? parseFloat(cropProd) : null,
          rainfall: cropRain ? parseFloat(cropRain) : null,
          temperature: cropTemp ? parseFloat(cropTemp) : null,
          fertilizer_usage: cropFert ? parseFloat(cropFert) : null,
          previous_yield: cropPrev ? parseFloat(cropPrev) : null,
        }),
      });

      if (res.ok) {
        showSuccess("Crop record saved successfully");
        setCropName("");
        setCropArea("");
        setCropProd("");
        setCropRain("");
        setCropTemp("");
        setCropFert("");
        setCropPrev("");
        setEditingCropId(null);
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to save crop record");
      }
    } catch (e) {
      showError("Network error saving crop record.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = async (id: number) => {
    if (!confirm("Delete this crop record?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crops/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Crop record deleted");
        loadAllData();
      } else {
        showError("Failed to delete crop record");
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Soil Record CRUD
  const saveSoilRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilFarmId || !soilPh) {
      showError("Farm and Soil pH value are required");
      return;
    }
    setIsLoading(true);
    try {
      const url = editingSoilId ? `${API_BASE}/soils/${editingSoilId}` : `${API_BASE}/soils`;
      const method = editingSoilId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_id: parseInt(soilFarmId),
          ph_value: parseFloat(soilPh),
          nitrogen: soilN ? parseFloat(soilN) : null,
          phosphorus: soilP ? parseFloat(soilP) : null,
          potassium: soilK ? parseFloat(soilK) : null,
          organic_matter: soilOrganic ? parseFloat(soilOrganic) : null,
          fertility_level: soilFertility,
        }),
      });

      if (res.ok) {
        showSuccess("Soil analysis record saved");
        setSoilPh("");
        setSoilN("");
        setSoilP("");
        setSoilK("");
        setSoilOrganic("");
        setSoilFertility("Medium");
        setEditingSoilId(null);
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to save soil record");
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSoil = async (id: number) => {
    if (!confirm("Delete this soil record?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/soils/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Soil record deleted");
        loadAllData();
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Weather Record CRUD
  const saveWeatherRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherFarmId) {
      showError("Farm selection is required");
      return;
    }
    setIsLoading(true);
    try {
      const url = editingWeatherId ? `${API_BASE}/weather/${editingWeatherId}` : `${API_BASE}/weather`;
      const method = editingWeatherId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_id: parseInt(weatherFarmId),
          rainfall: weatherRain ? parseFloat(weatherRain) : null,
          average_temperature: weatherTemp ? parseFloat(weatherTemp) : null,
          humidity: weatherHumid ? parseFloat(weatherHumid) : null,
          climate_condition: weatherCondition,
        }),
      });

      if (res.ok) {
        showSuccess("Weather conditions logged");
        setWeatherRain("");
        setWeatherTemp("");
        setWeatherHumid("");
        setWeatherCondition("Sunny");
        setEditingWeatherId(null);
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to save weather data");
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWeather = async (id: number) => {
    if (!confirm("Delete this weather record?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/weather/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Weather record removed");
        loadAllData();
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Historical Record CRUD
  const saveHistoricalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!histFarmId || !histYear || !histCrop || !histYield) {
      showError("Farm, year, crop name, and yield are required");
      return;
    }
    setIsLoading(true);
    try {
      const url = editingHistId ? `${API_BASE}/historical/${editingHistId}` : `${API_BASE}/historical`;
      const method = editingHistId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_id: parseInt(histFarmId),
          year: parseInt(histYear),
          crop_name: histCrop,
          yield_amount: parseFloat(histYield),
          rainfall: histRain ? parseFloat(histRain) : null,
          temperature: histTemp ? parseFloat(histTemp) : null,
          notes: histNotes,
        }),
      });

      if (res.ok) {
        showSuccess("Historical farming record saved");
        setHistYear("");
        setHistCrop("");
        setHistYield("");
        setHistRain("");
        setHistTemp("");
        setHistNotes("");
        setEditingHistId(null);
        loadAllData();
      } else {
        const d = await res.json();
        showError(d.detail || "Failed to save historical record");
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistorical = async (id: number) => {
    if (!confirm("Delete this historical record?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/historical/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Historical record removed");
        loadAllData();
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Dataset Upload
  const handleUploadCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingFile) {
      showError("Please select a CSV file first");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadingFile);

      const res = await fetch(`${API_BASE}/datasets/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(`CSV File "${data.filename}" uploaded and preprocessed successfully.`);
        setUploadingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPreprocessDetails(data.metrics);
        loadAllData();
      } else {
        showError(data.detail || "CSV dataset upload failed");
      }
    } catch (e) {
      showError("Error connecting to dataset ingestion service.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDataset = async (id: number) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/datasets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Dataset deleted from system");
        if (preprocessDetails && preprocessDetails.id === id) {
          setPreprocessDetails(null);
        }
        loadAllData();
      } else {
        showError("Failed to delete dataset");
      }
    } catch (e) {
      showError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const runYieldPrediction = async (formData: any) => {
    setPredictionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict-yield`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Yield prediction failed");
      }

      let recommendationsData = null;
      try {
        const recRes = await fetch(`${API_BASE}/analytics/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            crop_type: formData.crop_name || "Rice",
            avg_temp: formData.avg_temp,
            rainfall: formData.rainfall,
            soil_ph: formData.soil_ph,
            nitrogen: formData.nitrogen || 0,
            phosphorus: formData.phosphorus || 0,
            potassium: formData.potassium || 0,
          }),
        });
        if (recRes.ok) {
          recommendationsData = await recRes.json();
        }
      } catch (recErr) {
        console.error("Failed to fetch recommendations:", recErr);
      }

      setPredictionResult({
        ...data,
        recommendations_data: recommendationsData,
      });

      // Refresh prediction logs
      try {
        const predLogsRes = await fetch(`${API_BASE}/reports/predictions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (predLogsRes.ok) {
          setPredictionLogs(await predLogsRes.json());
        }
      } catch (err) {
        console.error("Failed to refresh prediction logs:", err);
      }

      showSuccess("AI Yield prediction completed successfully.");
    } catch (err: any) {
      showError(err.message || "Prediction request failed. Ensure the model is trained.");
    } finally {
      setPredictionLoading(false);
    }
  };

  const downloadCSVReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/export-csv`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to export CSV report");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "yield_predictions_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSuccess("CSV Report downloaded successfully.");
    } catch (error) {
      showError("Could not download CSV report.");
    }
  };

  const downloadFarmReportCSV = async (farmId: number, farmName: string) => {
    try {
      const res = await fetch(`${API_BASE}/reports/farms/${farmId}/export-csv`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to export farm CSV report");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm_${farmId}_${farmName.replace(/\s+/g, "_")}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSuccess(`Report for ${farmName} downloaded successfully.`);
    } catch (error) {
      showError(`Could not download report for ${farmName}.`);
    }
  };

  const downloadPDFReport = () => {
    if (!predictionResult) return;
    
    const crop = predictionResult.crop_name || "Rice";
    const yieldValue = predictionResult.predicted_yield ?? predictionResult.predicted_yield_kg_per_ha ?? 0;
    const confidence = predictionResult.confidence_score ?? 0;
    const temp = predictionResult.weather_analysis?.avg_temp || predictionResult.weather_analysis?.temperature || "";
    const rain = predictionResult.weather_analysis?.rainfall || "";
    const ph = predictionResult.soil_analysis?.ph || predictionResult.soil_analysis?.soil_ph || "";
    const n = predictionResult.soil_analysis?.nitrogen || 0;
    const p = predictionResult.soil_analysis?.phosphorus || 0;
    const k = predictionResult.soil_analysis?.potassium || 0;
    
    const recs = predictionResult.recommendations_data?.actionable_recommendations || [];
    const risks = predictionResult.recommendations_data?.identified_risks || [];
    const tips = predictionResult.recommendations_data?.best_practice_tips || [];
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showError("Pop-up blocked. Please allow pop-ups to print/download PDF.");
      return;
    }
    
    const recsHtml = recs.map((r: string) => `<li>${r}</li>`).join("");
    const risksHtml = risks.map((r: any) => `
      <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
        <strong style="color: #991b1b;">${r.type} (${r.severity} Severity)</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d;">${r.advice}</p>
      </div>
    `).join("");
    const tipsHtml = tips.map((t: string) => `<li style="font-style: italic; color: #4b5563;">"${t}"</li>`).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>YieldSense AI - Prediction Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 30px; line-height: 1.5; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #065f46; margin: 0; }
            .date { font-size: 12px; color: #6b7280; }
            .metric-grid { display: grid; grid-cols: 3; gap: 20px; margin-bottom: 30px; }
            .metric-card { background: #f3f4f6; border-radius: 8px; padding: 15px; border-left: 4px solid #10b981; }
            .metric-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #4b5563; }
            .metric-value { font-size: 28px; font-weight: 800; color: #111827; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .data-table th, .data-table td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-size: 14px; }
            .data-table th { background-color: #f9fafb; font-weight: bold; }
            ul { padding-left: 20px; margin: 0; }
            li { margin-bottom: 6px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">YieldSense AI</h1>
              <span style="font-size: 12px; color: #059669; font-weight: 600;">Crop Yield Prediction & Decision Support Report</span>
            </div>
            <span class="date">Generated: ${new Date().toLocaleString()}</span>
          </div>
          
          <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div class="metric-card" style="flex: 1;">
              <div class="metric-title">Crop Cultivation Forecast</div>
              <div class="metric-value">${crop}</div>
            </div>
            <div class="metric-card" style="flex: 1; border-left-color: #3b82f6;">
              <div class="metric-title">Predicted Yield</div>
              <div class="metric-value">${yieldValue.toLocaleString()} <span style="font-size: 14px; font-weight: normal; color: #6b7280;">kg/ha</span></div>
            </div>
            <div class="metric-card" style="flex: 1; border-left-color: #f59e0b;">
              <div class="metric-title">AI Confidence Score</div>
              <div class="metric-value">${confidence}%</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Input Farm Parameters</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Soil pH</th>
                  <th>Nitrogen (N)</th>
                  <th>Phosphorus (P)</th>
                  <th>Potassium (K)</th>
                  <th>Avg Temperature</th>
                  <th>Rainfall</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${ph}</td>
                  <td>${n} ppm</td>
                  <td>${p} ppm</td>
                  <td>${k} ppm</td>
                  <td>${temp}°C</td>
                  <td>${rain} mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${risksHtml ? `
          <div class="section">
            <div class="section-title" style="color: #b91c1c;">Environmental Stress Alerts</div>
            ${risksHtml}
          </div>
          ` : ""}

          ${recsHtml ? `
          <div class="section">
            <div class="section-title">Actionable Recommendation & Soil Advice</div>
            <ul>${recsHtml}</ul>
          </div>
          ` : ""}

          ${tipsHtml ? `
          <div class="section">
            <div class="section-title">Best Agricultural Practices</div>
            <ul>${tipsHtml}</ul>
          </div>
          ` : ""}

          <div style="margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 11px; color: #9ca3af;">
            YieldSense AI Agricultural Productivity System &copy; ${new Date().getFullYear()}
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showSuccess("PDF Report generated. Click Print/Save to download.");
  };

  const getLatestClimateAlerts = () => {
    const alerts = [];
    if (weather.length > 0) {
      const latest = weather[0];
      if (latest.rainfall < 200) {
        alerts.push({
          type: "drought",
          title: "Drought Warning",
          desc: `Critical rainfall level (${latest.rainfall}mm) registered. Supplement with immediate drip irrigation.`,
          bg: "bg-rose-50 border-rose-200/50",
          textColor: "text-rose-800",
          iconColor: "text-rose-600",
        });
      } else if (latest.rainfall > 1200) {
        alerts.push({
          type: "flood",
          title: "Flood Risk Alert",
          desc: `High rainfall (${latest.rainfall}mm) registered. Clear field drainage channels to prevent root rot.`,
          bg: "bg-rose-50 border-rose-200/50",
          textColor: "text-rose-800",
          iconColor: "text-rose-600",
        });
      } else {
        alerts.push({
          type: "favorable",
          title: "Favorable Precipitation Band",
          desc: `Recent rainfall (${latest.rainfall}mm) supports productive crop development.`,
          bg: "bg-emerald-50 border-emerald-200/50",
          textColor: "text-emerald-800",
          iconColor: "text-emerald-600",
        });
      }
      
      if (latest.average_temperature > 35) {
        alerts.push({
          type: "heat",
          title: "Extreme Heat Risk",
          desc: `Temperature is at ${latest.average_temperature}°C. Consider shade netting or morning/evening watering.`,
          bg: "bg-amber-50 border-amber-200/50",
          textColor: "text-amber-800",
          iconColor: "text-amber-600",
        });
      } else if (latest.average_temperature < 18) {
        alerts.push({
          type: "cold",
          title: "Cool Temperature Alert",
          desc: `Cooler temp (${latest.average_temperature}°C) detected. Avoid over-watering and monitor soil status.`,
          bg: "bg-blue-50 border-blue-200/50",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
        });
      }
    }
    
    if (soils.length > 0) {
      const latest = soils[0];
      if (latest.ph_value < 5.8) {
        alerts.push({
          type: "soil_ph",
          title: "Acidic Soil Alert",
          desc: `Soil pH is low (${latest.ph_value}). Apply agricultural lime to raise soil pH to optimal levels.`,
          bg: "bg-amber-50 border-amber-200/50",
          textColor: "text-amber-800",
          iconColor: "text-amber-600",
        });
      } else if (latest.ph_value > 7.8) {
        alerts.push({
          type: "soil_ph",
          title: "Alkaline Soil Warning",
          desc: `Soil pH is high (${latest.ph_value}). Use organic matter or elemental sulfur to adjust soil pH.`,
          bg: "bg-amber-50 border-amber-200/50",
          textColor: "text-amber-800",
          iconColor: "text-amber-600",
        });
      }
    }
    
    if (alerts.length === 0) {
      alerts.push({
        type: "info",
        title: "Rainfall Baseline Observation",
        desc: "Local microclimates indicate precipitation levels are slightly below expected quarterly averages. Add Soil/Weather logs.",
        bg: "bg-amber-50 border-amber-200/50",
        textColor: "text-soil",
        iconColor: "text-amber-600",
      });
      alerts.push({
        type: "drip",
        title: "Drip Irrigation Advisory",
        desc: "Optimal watering interval for Loamy soil type is early morning between 05:00 and 08:00 to reduce evaporation.",
        bg: "bg-teal-50 border-teal-200/50",
        textColor: "text-teal-800",
        iconColor: "text-teal-600",
      });
    }
    
    return alerts;
  };

  const avgYieldVal = historical.length > 0
    ? Math.round(historical.reduce((sum, r) => sum + r.yield_amount, 0) / historical.length)
    : 4250;
  const soilHealthVal = soils.length > 0 && soils[0].fertility_level ? `${soils[0].fertility_level} Fertility` : "94% Optimal";
  const weatherStatusVal = weather.length > 0 && weather[0].climate_condition ? weather[0].climate_condition : "Favorable";

  return (
    <main className="min-h-screen bg-field font-sans text-ink">
      {/* Top Navbar Banner */}
      <header className="sticky top-0 z-50 border-b border-canopy/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-canopy text-white transition-transform hover:scale-105">
              <Sprout className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-canopy">YieldSense AI</h1>
              <p className="text-xs font-medium text-soil">Agricultural Productivity & Data Forecasting System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Server Status Telemetry */}
            <div className="hidden items-center gap-3 rounded-full border border-canopy/10 bg-field px-4 py-1.5 text-xs font-semibold md:flex">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-water" />
                Backend:
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  sysStatus.backend === "Connected" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {sysStatus.backend}
                </span>
              </span>
              <span className="h-3 w-[1px] bg-canopy/15"></span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-canopy" />
                Database:
                <span className="text-canopy font-bold">Active</span>
              </span>
            </div>

            {token && currentUser && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-ink">{currentUser.email}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soil">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                  title="Logout Session"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Flash Notifications */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-canopy/10 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-xl">
              <RefreshCw className="h-10 w-10 animate-spin text-canopy" />
              <span className="text-sm font-semibold text-canopy">Synchronizing Agricultural Data...</span>
            </div>
          </div>
        )}

        {!token ? (
          /* GUEST WELCOME & HERO LANDING PAGE */
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center py-6">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-canopy">
                AI-Driven Precision Agriculture
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-canopy leading-tight">
                Empowering Agriculture With Intelligent Predictive Systems
              </h2>
              <p className="text-lg text-ink/75 leading-relaxed">
                YieldSense AI helps farmers, researchers, and agronomists digitize soil health, track local microclimate variations, log seasonal crop yield data, and manage large-scale agricultural datasets in a secure role-based dashboard.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-canopy/10 bg-white p-4 shadow-xs">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-canopy">
                    <Tractor className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-ink">Farm Onboarding</h3>
                  <p className="text-xs text-ink/60 mt-1">Configure geo-coordinates, acreage, irrigation profiles, and soil baselines.</p>
                </div>
                <div className="rounded-xl border border-canopy/10 bg-white p-4 shadow-xs">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <CloudRain className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-ink">Environmental Tracking</h3>
                  <p className="text-xs text-ink/60 mt-1">Log temperature deviations, relative humidity, rainfalls, and chemical compositions.</p>
                </div>
                <div className="rounded-xl border border-canopy/10 bg-white p-4 shadow-xs">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-ink">Preprocessing Pipeline</h3>
                  <p className="text-xs text-ink/60 mt-1">Upload raw crop yield datasets and impute missing variables in a clean, visual workflow.</p>
                </div>
                <div className="rounded-xl border border-canopy/10 bg-white p-4 shadow-xs">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-ink">Role-Based Access (RBAC)</h3>
                  <p className="text-xs text-ink/60 mt-1">Isolated views and functional controls for Farmers, Admins, and Experts.</p>
                </div>
              </div>
            </div>

            {/* Login / Register Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-canopy/10 bg-white p-6 shadow-soft">
                <div className="mb-6 flex border-b border-canopy/10 pb-4">
                  <button
                    onClick={() => setAuthView("login")}
                    className={`flex-1 pb-2 text-center text-sm font-bold tracking-wide transition-all ${
                      authView === "login" ? "border-b-2 border-canopy text-canopy font-extrabold" : "text-ink/40"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setAuthView("register")}
                    className={`flex-1 pb-2 text-center text-sm font-bold tracking-wide transition-all ${
                      authView === "register" ? "border-b-2 border-canopy text-canopy font-extrabold" : "text-ink/40"
                    }`}
                  >
                    CREATE ACCOUNT
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/65 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. farmer@yieldsense.ai"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-canopy/15 bg-field px-3.5 text-sm font-medium outline-none transition focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/65 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-canopy/15 bg-field px-3.5 text-sm font-medium outline-none transition focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                    />
                  </div>

                  {authView === "register" && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink/65 mb-1.5">Select Account Role</label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                        className="h-11 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none transition focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                      >
                        <option value="Farmer">Farmer (Manage Crops, Soil & Farms)</option>
                        <option value="Agriculture Expert">Agriculture Expert / Analyst</option>
                        <option value="Admin">System Administrator</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-canopy px-4 text-sm font-bold text-white transition-all hover:bg-canopy/95 shadow-md active:translate-y-0.5"
                  >
                    <UserCheck className="h-4 w-4" />
                    {authView === "login" ? "Secure Login" : "Register Credentials"}
                  </button>
                </form>

                <div className="mt-5 rounded-lg bg-amber-50 border border-amber-200/50 px-3.5 py-3 text-xs text-soil leading-relaxed flex gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">System Credentials Rule:</span> Passwords require a minimum of 8 characters. Email must be unique. Access roles dictate data edit authorizations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED PANEL LAYOUT */
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar Navigation */}
            <aside className="flex flex-col gap-2 rounded-xl border border-canopy/10 bg-white p-4 shadow-sm h-fit">
              <div className="px-2 py-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-soil">Data Management</span>
              </div>
              <nav className="space-y-1.5">
                {[
                  { id: "dashboard", label: "Dashboard Overview", icon: Activity },
                  { id: "profile", label: "Farmer Profile", icon: User },
                  { id: "farms", label: "Farm Inventory", icon: Tractor },
                  { id: "crops", label: "Crop Cultivation", icon: Sprout },
                  { id: "soils", label: "Soil Analysis", icon: Layers },
                  { id: "weather", label: "Climate Logs", icon: CloudRain },
                  { id: "historical", label: "Historical Yields", icon: Calendar },
                  { id: "predict", label: "Yield Prediction", icon: Cpu },
                  { id: "datasets", label: "Dataset Pipeline", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setEditingFarmId(null);
                        setEditingCropId(null);
                        setEditingSoilId(null);
                        setEditingWeatherId(null);
                        setEditingHistId(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                        activeTab === item.id
                          ? "bg-canopy text-white shadow-sm"
                          : "text-ink/70 hover:bg-field hover:text-canopy"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}

                {currentUser?.role === "Admin" && (
                  <>
                    <div className="h-[1px] bg-canopy/10 my-3"></div>
                    <button
                      onClick={() => setActiveTab("admin")}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                        activeTab === "admin"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-amber-800 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Admin Control Panel
                    </button>
                  </>
                )}
              </nav>
            </aside>

            {/* Central Workspace */}
            <section className="space-y-6">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <DashboardCharts
                    stats={{
                      totalFarms: farms.length,
                      totalPredictions: predictionLogs.length,
                      avgYield: avgYieldVal,
                      soilHealth: soilHealthVal,
                      weatherStatus: weatherStatusVal,
                    }}
                    historicalRecords={historical}
                    cropRecords={crops}
                    predictionLogs={predictionLogs}
                  />

                  <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                      {/* Recent Activities */}
                      <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-soil" />
                          Recent System Activity Log
                        </h3>
                        {recentActivities.length === 0 ? (
                          <p className="text-sm text-ink/50 py-4 text-center">No active record registries found. Add a farm to get started!</p>
                        ) : (
                          <div className="flow-root">
                            <ul className="-mb-8">
                              {recentActivities.map((act, index) => (
                                <li key={index}>
                                  <div className="relative pb-8">
                                    {index !== recentActivities.length - 1 ? (
                                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-canopy/10" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                      <div>
                                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center ring-8 ring-white ${
                                          act.type === "Farm" ? "bg-emerald-50 text-canopy" :
                                          act.type === "Crop" ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700"
                                        }`}>
                                          <CheckCircle className="h-4 w-4" />
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                          <p className="text-sm font-bold text-ink">{act.title}</p>
                                          <p className="text-xs text-ink/65 mt-0.5">{act.desc}</p>
                                        </div>
                                        <div className="text-right text-[10px] font-semibold text-ink/40 whitespace-nowrap">
                                          {act.time}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Climate Warnings / Recommendations placeholder */}
                      <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm overflow-y-auto max-h-[350px]">
                        <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                          <CloudRain className="h-5 w-5 text-water" />
                          Climate Alerts &amp; Irrigation Optimization
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {getLatestClimateAlerts().map((alert, idx) => (
                            <div key={idx} className={`rounded-lg ${alert.bg} p-4`}>
                              <div className="flex items-start gap-3">
                                <AlertCircle className={`h-5 w-5 ${alert.iconColor} shrink-0 mt-0.5`} />
                                <div>
                                  <span className={`font-bold ${alert.textColor} text-sm block`}>{alert.title}</span>
                                  <span className={`text-xs ${alert.textColor}/95 mt-1 block`}>{alert.desc}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Prediction Future Card */}
                    {/* AI Prediction Dashboard Card */}
                    <div className="rounded-xl border border-emerald-800 bg-slate-900 text-white p-6 shadow-lg flex flex-col justify-between relative overflow-hidden h-fit">
                      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl"></div>
                      <div className="space-y-4">
                        <div className="inline-block rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                          Active System Feature
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">AI Yield Prediction Engine</h3>
                        <p className="text-sm text-slate-350 leading-relaxed">
                          Run predictive inferences using our trained XGBoost Machine Learning model. Calculate expected yield (kg/ha) with advanced confidence metrics and customized agronomic advice.
                        </p>
                        <button
                          onClick={() => setActiveTab("predict")}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md"
                        >
                          <Cpu className="w-4 h-4" />
                          <span>Access Prediction Console</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE MANAGEMENT */}
              {activeTab === "profile" && (
                <div className="rounded-xl border border-canopy/10 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3 pb-3 border-b border-canopy/10">
                    <User className="h-6 w-6 text-canopy" />
                    <div>
                      <h3 className="text-lg font-bold text-canopy">Farmer &amp; Operator Profile</h3>
                      <p className="text-xs text-ink/60">Configure system contact details and agricultural experience settings</p>
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="space-y-4 max-w-xl">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-ink/75 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink/75 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={profPhone}
                          onChange={(e) => setProfPhone(e.target.value)}
                          className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/75 mb-1">Residential / Farm Address</label>
                      <textarea
                        rows={3}
                        value={profAddress}
                        onChange={(e) => setProfAddress(e.target.value)}
                        className="w-full rounded-lg border border-canopy/15 bg-field p-3 text-sm font-medium outline-none focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/75 mb-1">Agricultural Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={profExp}
                        onChange={(e) => setProfExp(parseInt(e.target.value) || 0)}
                        className="h-10 w-48 rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy focus:ring-4 focus:ring-canopy/10"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-10 rounded-lg bg-canopy px-6 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                    >
                      Save Profile Settings
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: FARMS MANAGEMENT */}
              {activeTab === "farms" && (
                <div className="space-y-6">
                  {/* Farm Input Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <Tractor className="h-5 w-5 text-soil" />
                      {editingFarmId ? "Update Farm Profile" : "Register New Farm Land"}
                    </h3>

                    <form onSubmit={saveFarm} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Farm Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. North Block"
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 22.5726"
                            value={farmLat}
                            onChange={(e) => setFarmLat(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 88.3639"
                            value={farmLng}
                            onChange={(e) => setFarmLng(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Size (Hectares) *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 15.5"
                            value={farmSize}
                            onChange={(e) => setFarmSize(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Soil Type</label>
                          <select
                            value={farmSoil}
                            onChange={(e) => setFarmSoil(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          >
                            <option>Loamy</option>
                            <option>Clayey</option>
                            <option>Sandy</option>
                            <option>Silty</option>
                            <option>Peaty</option>
                            <option>Saline</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Irrigation Method</label>
                          <select
                            value={farmIrrig}
                            onChange={(e) => setFarmIrrig(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          >
                            <option>Drip</option>
                            <option>Sprinkler</option>
                            <option>Canal Flood</option>
                            <option>Rain-fed only</option>
                            <option>Manual / Pivot</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink/75 mb-1">Primary Crops Grown</label>
                          <input
                            type="text"
                            placeholder="Rice, Wheat, Maize"
                            value={farmCrops}
                            onChange={(e) => setFarmCrops(e.target.value)}
                            className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                        >
                          {editingFarmId ? "Update Farm Profile" : "Register Farm Land"}
                        </button>
                        {editingFarmId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFarmId(null);
                              setFarmName("");
                              setFarmLat("");
                              setFarmLng("");
                              setFarmSize("");
                              setFarmSoil("Loamy");
                              setFarmIrrig("Drip");
                              setFarmCrops("");
                            }}
                            className="h-10 rounded-lg border border-canopy/20 bg-white px-5 text-sm font-bold text-canopy transition hover:bg-field"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Farms Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Registered Farm Assets</h3>
                    {farms.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No farms registered under this account.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Farm ID</th>
                              <th className="px-4 py-3 font-semibold">Farm Name</th>
                              <th className="px-4 py-3 font-semibold">Coordinates</th>
                              <th className="px-4 py-3 font-semibold">Size</th>
                              <th className="px-4 py-3 font-semibold">Soil Type</th>
                              <th className="px-4 py-3 font-semibold">Irrigation</th>
                              <th className="px-4 py-3 font-semibold">Crops Grown</th>
                              <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {farms.map((f) => (
                              <tr key={f.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                <td className="px-4 py-3 text-ink/60 font-mono text-xs">#{f.id}</td>
                                <td className="px-4 py-3 font-bold text-canopy">{f.farm_name}</td>
                                <td className="px-4 py-3 text-xs text-ink/85 font-mono">({f.latitude}, {f.longitude})</td>
                                <td className="px-4 py-3 text-ink/80">{f.farm_size} ha</td>
                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 text-xs font-semibold">{f.soil_type}</span></td>
                                <td className="px-4 py-3 text-ink/75">{f.irrigation_type}</td>
                                <td className="px-4 py-3 text-ink/75">{f.crops_grown || "-"}</td>
                                <td className="px-4 py-3 flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingFarmId(f.id);
                                      setFarmName(f.farm_name);
                                      setFarmLat(f.latitude.toString());
                                      setFarmLng(f.longitude.toString());
                                      setFarmSize(f.farm_size.toString());
                                      setFarmSoil(f.soil_type || "Loamy");
                                      setFarmIrrig(f.irrigation_type || "Drip");
                                      setFarmCrops(f.crops_grown || "");
                                    }}
                                    className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                                    title="Edit details"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteFarm(f.id)}
                                    className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    title="Delete farm asset"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => downloadFarmReportCSV(f.id, f.farm_name)}
                                    className="p-1.5 rounded bg-blue-50 text-blue-800 transition hover:bg-blue-100 border border-blue-200"
                                    title="Download farm report CSV"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CROP CULTIVATION RECORDS */}
              {activeTab === "crops" && (
                <div className="space-y-6">
                  {/* Crop Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-amber-600" />
                      {editingCropId ? "Modify Cultivation Registry" : "Register Crop Cultivation Log"}
                    </h3>

                    {farms.length === 0 ? (
                      <div className="rounded-lg bg-amber-50 p-4 text-sm text-soil border border-amber-200 flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
                        <span>Please create at least one farm asset before registry of crop records.</span>
                      </div>
                    ) : (
                      <form onSubmit={saveCropRecord} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Select Farm Asset *</label>
                            <select
                              value={cropFarmId}
                              onChange={(e) => setCropFarmId(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              {farms.map((f) => (
                                <option key={f.id} value={f.id}>{f.farm_name} (ID: {f.id})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Crop name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Maize"
                              value={cropName}
                              onChange={(e) => setCropName(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Cultivation Season</label>
                            <select
                              value={cropSeason}
                              onChange={(e) => setCropSeason(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            >
                              <option>Kharif</option>
                              <option>Rabi</option>
                              <option>Zaid</option>
                              <option>Perennial</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Cultivated Area (ha) *</label>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="e.g. 5.2"
                              value={cropArea}
                              onChange={(e) => setCropArea(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Production (kg)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 12000"
                              value={cropProd}
                              onChange={(e) => setCropProd(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-xs font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Rainfall (mm)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 800"
                              value={cropRain}
                              onChange={(e) => setCropRain(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-xs font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Temperature (°C)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 26.5"
                              value={cropTemp}
                              onChange={(e) => setCropTemp(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-xs font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Fertilizer (kg/ha)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 120"
                              value={cropFert}
                              onChange={(e) => setCropFert(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-xs font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Previous Yield (kg/ha)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 2100"
                              value={cropPrev}
                              onChange={(e) => setCropPrev(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-xs font-medium outline-none focus:border-canopy"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                          >
                            {editingCropId ? "Update Crop Record" : "Save Crop Record"}
                          </button>
                          {editingCropId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCropId(null);
                                setCropName("");
                                setCropArea("");
                                setCropProd("");
                                setCropRain("");
                                setCropTemp("");
                                setCropFert("");
                                setCropPrev("");
                              }}
                              className="h-10 rounded-lg border border-canopy/20 bg-white px-5 text-sm font-bold text-canopy transition hover:bg-field"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Crops Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Logged Crop Records</h3>
                    {crops.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No crop cultivation records registered yet.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-3 py-3 font-semibold">Farm Asset</th>
                              <th className="px-3 py-3 font-semibold">Crop</th>
                              <th className="px-3 py-3 font-semibold">Season</th>
                              <th className="px-3 py-3 font-semibold">Area</th>
                              <th className="px-3 py-3 font-semibold">Total Yield</th>
                              <th className="px-3 py-3 font-semibold">Precipitation</th>
                              <th className="px-3 py-3 font-semibold">Temperature</th>
                              <th className="px-3 py-3 font-semibold">Fertilizer Used</th>
                              <th className="px-3 py-3 font-semibold">Prev Yield</th>
                              <th className="px-3 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crops.map((c) => {
                              const associatedFarm = farms.find((f) => f.id === c.farm_id);
                              return (
                                <tr key={c.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                  <td className="px-3 py-3 font-semibold text-canopy">{associatedFarm?.farm_name || `ID: ${c.farm_id}`}</td>
                                  <td className="px-3 py-3 font-bold text-soil">{c.crop_name}</td>
                                  <td className="px-3 py-3 text-xs">{c.season}</td>
                                  <td className="px-3 py-3 text-ink/80">{c.area_cultivated} ha</td>
                                  <td className="px-3 py-3 text-ink/80 font-semibold">{c.production_amount ? `${c.production_amount} kg` : "-"}</td>
                                  <td className="px-3 py-3 text-ink/75">{c.rainfall ? `${c.rainfall} mm` : "-"}</td>
                                  <td className="px-3 py-3 text-ink/75">{c.temperature ? `${c.temperature} °C` : "-"}</td>
                                  <td className="px-3 py-3 text-ink/75">{c.fertilizer_usage ? `${c.fertilizer_usage} kg/ha` : "-"}</td>
                                  <td className="px-3 py-3 text-ink/75">{c.previous_yield ? `${c.previous_yield} kg/ha` : "-"}</td>
                                  <td className="px-3 py-3 flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingCropId(c.id);
                                        setCropFarmId(c.farm_id.toString());
                                        setCropName(c.crop_name);
                                        setCropSeason(c.season || "Kharif");
                                        setCropArea(c.area_cultivated.toString());
                                        setCropProd(c.production_amount ? c.production_amount.toString() : "");
                                        setCropRain(c.rainfall ? c.rainfall.toString() : "");
                                        setCropTemp(c.temperature ? c.temperature.toString() : "");
                                        setCropFert(c.fertilizer_usage ? c.fertilizer_usage.toString() : "");
                                        setCropPrev(c.previous_yield ? c.previous_yield.toString() : "");
                                      }}
                                      className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteCrop(c.id)}
                                      className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SOIL ANALYTICAL RECORDS */}
              {activeTab === "soils" && (
                <div className="space-y-6">
                  {/* Soil Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-teal-700" />
                      {editingSoilId ? "Update Soil Nutrients Record" : "Input Soil Analytics Sample"}
                    </h3>

                    {farms.length === 0 ? (
                      <div className="rounded-lg bg-amber-50 p-4 text-sm text-soil border border-amber-200 flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
                        <span>Configure a farm asset first.</span>
                      </div>
                    ) : (
                      <form onSubmit={saveSoilRecord} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Select Farm Asset *</label>
                            <select
                              value={soilFarmId}
                              onChange={(e) => setSoilFarmId(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              {farms.map((f) => (
                                <option key={f.id} value={f.id}>{f.farm_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">pH Value (0-14) *</label>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="e.g. 6.8"
                              value={soilPh}
                              onChange={(e) => setSoilPh(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Nitrogen (N - mg/kg)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 42.5"
                              value={soilN}
                              onChange={(e) => setSoilN(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Phosphorus (P - mg/kg)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 28.1"
                              value={soilP}
                              onChange={(e) => setSoilP(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Potassium (K - mg/kg)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 33.6"
                              value={soilK}
                              onChange={(e) => setSoilK(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Organic Matter (%)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 2.45"
                              value={soilOrganic}
                              onChange={(e) => setSoilOrganic(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">General Fertility Level</label>
                            <select
                              value={soilFertility}
                              onChange={(e) => setSoilFertility(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              <option>High</option>
                              <option>Medium</option>
                              <option>Low</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                          >
                            Save Soil Record
                          </button>
                          {editingSoilId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSoilId(null);
                                setSoilPh("");
                                setSoilN("");
                                setSoilP("");
                                setSoilK("");
                                setSoilOrganic("");
                                setSoilFertility("Medium");
                              }}
                              className="h-10 rounded-lg border border-canopy/20 bg-white px-5 text-sm font-bold text-canopy transition hover:bg-field"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Soil Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Logged Soil Records</h3>
                    {soils.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No soil logs submitted yet.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Farm Asset</th>
                              <th className="px-4 py-3 font-semibold">pH Value</th>
                              <th className="px-4 py-3 font-semibold">Nitrogen (N)</th>
                              <th className="px-4 py-3 font-semibold">Phosphorus (P)</th>
                              <th className="px-4 py-3 font-semibold">Potassium (K)</th>
                              <th className="px-4 py-3 font-semibold">Organic Matter</th>
                              <th className="px-4 py-3 font-semibold">Fertility Status</th>
                              <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {soils.map((s) => {
                              const associatedFarm = farms.find((f) => f.id === s.farm_id);
                              return (
                                <tr key={s.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                  <td className="px-4 py-3 font-semibold text-canopy">{associatedFarm?.farm_name || `ID: ${s.farm_id}`}</td>
                                  <td className="px-4 py-3 font-bold text-ink/80">{s.ph_value}</td>
                                  <td className="px-4 py-3 text-ink/75 font-mono">{s.nitrogen ? `${s.nitrogen} mg/kg` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/75 font-mono">{s.phosphorus ? `${s.phosphorus} mg/kg` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/75 font-mono">{s.potassium ? `${s.potassium} mg/kg` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/75 font-mono">{s.organic_matter ? `${s.organic_matter} %` : "-"}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      s.fertility_level === "High" ? "bg-emerald-100 text-emerald-800" :
                                      s.fertility_level === "Medium" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                                    }`}>
                                      {s.fertility_level || "Unknown"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingSoilId(s.id);
                                        setSoilFarmId(s.farm_id.toString());
                                        setSoilPh(s.ph_value.toString());
                                        setSoilN(s.nitrogen ? s.nitrogen.toString() : "");
                                        setSoilP(s.phosphorus ? s.phosphorus.toString() : "");
                                        setSoilK(s.potassium ? s.potassium.toString() : "");
                                        setSoilOrganic(s.organic_matter ? s.organic_matter.toString() : "");
                                        setSoilFertility(s.fertility_level || "Medium");
                                      }}
                                      className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteSoil(s.id)}
                                      className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: CLIMATE & WEATHER INPUT LOGS */}
              {activeTab === "weather" && (
                <div className="space-y-6">
                  {/* Weather Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-blue-600" />
                      {editingWeatherId ? "Update Microclimate Log" : "Log Microclimate Readings"}
                    </h3>

                    {farms.length === 0 ? (
                      <div className="rounded-lg bg-amber-50 p-4 text-sm text-soil border border-amber-200 flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
                        <span>Farms must be set up first.</span>
                      </div>
                    ) : (
                      <form onSubmit={saveWeatherRecord} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Select Farm Asset *</label>
                            <select
                              value={weatherFarmId}
                              onChange={(e) => setWeatherFarmId(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              {farms.map((f) => (
                                <option key={f.id} value={f.id}>{f.farm_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Rainfall Amount (mm)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 24.5"
                              value={weatherRain}
                              onChange={(e) => setWeatherRain(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Avg Temperature (°C)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 28.5"
                              value={weatherTemp}
                              onChange={(e) => setWeatherTemp(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Humidity (%)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 72"
                              value={weatherHumid}
                              onChange={(e) => setWeatherHumid(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Climate Condition</label>
                            <select
                              value={weatherCondition}
                              onChange={(e) => setWeatherCondition(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              <option>Sunny</option>
                              <option>Rainy</option>
                              <option>Humid / Cloudy</option>
                              <option>Dry / Wind</option>
                              <option>Storm / Heavy Precipit</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                          >
                            Save Weather Record
                          </button>
                          {editingWeatherId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWeatherId(null);
                                setWeatherRain("");
                                setWeatherTemp("");
                                setWeatherHumid("");
                                setWeatherCondition("Sunny");
                              }}
                              className="h-10 rounded-lg border border-canopy/20 bg-white px-5 text-sm font-bold text-canopy transition hover:bg-field"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Weather Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Environmental &amp; Climate Logs</h3>
                    {weather.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No climate data logged for farms yet.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Farm Asset</th>
                              <th className="px-4 py-3 font-semibold">Rainfall logged</th>
                              <th className="px-4 py-3 font-semibold">Average Temperature</th>
                              <th className="px-4 py-3 font-semibold">Relative Humidity</th>
                              <th className="px-4 py-3 font-semibold">Condition</th>
                              <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weather.map((w) => {
                              const associatedFarm = farms.find((f) => f.id === w.farm_id);
                              return (
                                <tr key={w.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                  <td className="px-4 py-3 font-semibold text-canopy">{associatedFarm?.farm_name || `ID: ${w.farm_id}`}</td>
                                  <td className="px-4 py-3 text-ink/80">{w.rainfall ? `${w.rainfall} mm` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/80 font-mono">{w.average_temperature ? `${w.average_temperature} °C` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/75 font-mono">{w.humidity ? `${w.humidity}%` : "-"}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold">
                                      {w.climate_condition || "Clear"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingWeatherId(w.id);
                                        setWeatherFarmId(w.farm_id.toString());
                                        setWeatherRain(w.rainfall ? w.rainfall.toString() : "");
                                        setWeatherTemp(w.average_temperature ? w.average_temperature.toString() : "");
                                        setWeatherHumid(w.humidity ? w.humidity.toString() : "");
                                        setWeatherCondition(w.climate_condition || "Sunny");
                                      }}
                                      className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteWeather(w.id)}
                                      className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: HISTORICAL FARMING RECORDS */}
              {activeTab === "historical" && (
                <div className="space-y-6">
                  {/* Historical Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-canopy" />
                      {editingHistId ? "Update Historical Performance Log" : "Log Historical Yield Performance"}
                    </h3>

                    {farms.length === 0 ? (
                      <div className="rounded-lg bg-amber-50 p-4 text-sm text-soil border border-amber-200 flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
                        <span>Farms must be set up first.</span>
                      </div>
                    ) : (
                      <form onSubmit={saveHistoricalRecord} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Select Farm Asset *</label>
                            <select
                              value={histFarmId}
                              onChange={(e) => setHistFarmId(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none"
                            >
                              {farms.map((f) => (
                                <option key={f.id} value={f.id}>{f.farm_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Cultivation Year *</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 2024"
                              value={histYear}
                              onChange={(e) => setHistYear(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Crop Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="Rice"
                              value={histCrop}
                              onChange={(e) => setHistCrop(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Yield Yield (kg/ha) *</label>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="e.g. 3450"
                              value={histYield}
                              onChange={(e) => setHistYield(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Seasonal Rainfall (mm)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 920"
                              value={histRain}
                              onChange={(e) => setHistRain(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">Average Temp (°C)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="e.g. 27.2"
                              value={histTemp}
                              onChange={(e) => setHistTemp(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink/75 mb-1">General Notes</label>
                            <input
                              type="text"
                              placeholder="Excellent harvest, minimal pest damage"
                              value={histNotes}
                              onChange={(e) => setHistNotes(e.target.value)}
                              className="h-10 w-full rounded-lg border border-canopy/15 bg-field px-3 text-sm font-medium outline-none focus:border-canopy"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                          >
                            Save Historical Record
                          </button>
                          {editingHistId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHistId(null);
                                setHistYear("");
                                setHistCrop("");
                                setHistYield("");
                                setHistRain("");
                                setHistTemp("");
                                setHistNotes("");
                              }}
                              className="h-10 rounded-lg border border-canopy/20 bg-white px-5 text-sm font-bold text-canopy transition hover:bg-field"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Historical Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Historical Yield Performance Records</h3>
                    {historical.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No historical records logged for this farmer account.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Farm Asset</th>
                              <th className="px-4 py-3 font-semibold">Year</th>
                              <th className="px-4 py-3 font-semibold">Crop Cultivated</th>
                              <th className="px-4 py-3 font-semibold">Yield (kg/ha)</th>
                              <th className="px-4 py-3 font-semibold">Precipitation</th>
                              <th className="px-4 py-3 font-semibold">Temperature</th>
                              <th className="px-4 py-3 font-semibold">Log Notes</th>
                              <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historical.map((h) => {
                              const associatedFarm = farms.find((f) => f.id === h.farm_id);
                              return (
                                <tr key={h.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                  <td className="px-4 py-3 font-semibold text-canopy">{associatedFarm?.farm_name || `ID: ${h.farm_id}`}</td>
                                  <td className="px-4 py-3 font-bold font-mono text-ink/75">{h.year}</td>
                                  <td className="px-4 py-3 font-bold text-soil">{h.crop_name}</td>
                                  <td className="px-4 py-3 text-ink font-semibold">{h.yield_amount} kg/ha</td>
                                  <td className="px-4 py-3 text-ink/70">{h.rainfall ? `${h.rainfall} mm` : "-"}</td>
                                  <td className="px-4 py-3 text-ink/70">{h.temperature ? `${h.temperature} °C` : "-"}</td>
                                  <td className="px-4 py-3 text-xs italic text-ink/60">{h.notes || "-"}</td>
                                  <td className="px-4 py-3 flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingHistId(h.id);
                                        setHistFarmId(h.farm_id.toString());
                                        setHistYear(h.year.toString());
                                        setHistCrop(h.crop_name);
                                        setHistYield(h.yield_amount.toString());
                                        setHistRain(h.rainfall ? h.rainfall.toString() : "");
                                        setHistTemp(h.temperature ? h.temperature.toString() : "");
                                        setHistNotes(h.notes || "");
                                      }}
                                      className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteHistorical(h.id)}
                                      className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7.5: AI YIELD PREDICTION & ANALYSIS */}
              {activeTab === "predict" && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <PredictionForm onPredict={runYieldPrediction} isLoading={predictionLoading} />
                    <PredictionCard
                      result={predictionResult}
                      onDownloadCSV={downloadCSVReport}
                      onDownloadPDF={downloadPDFReport}
                    />
                  </div>
                </div>
              )}

              {/* TAB 8: DATASET INGESTION & PIPELINE */}
              {activeTab === "datasets" && (
                <div className="space-y-6">
                  {/* CSV Upload Form */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-canopy" />
                      Upload Crop Yield / Weather CSV Dataset
                    </h3>

                    <form onSubmit={handleUploadCSV} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="block text-xs font-semibold text-ink/75">Select Dataset File (CSV format only)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setUploadingFile(e.target.files[0]);
                              }
                            }}
                            className="text-sm font-medium border border-canopy/15 rounded-lg p-2 bg-field text-ink/80 outline-none"
                          />
                          <button
                            type="submit"
                            className="h-10 rounded-lg bg-canopy px-5 text-sm font-bold text-white transition hover:bg-canopy/90 shadow-sm"
                          >
                            Ingest &amp; Preprocess Dataset
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Pre-processing Log Banners */}
                  {preprocessDetails && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-5 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span>Active Pipeline Pre-processing Details</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-4 text-xs font-semibold text-ink/75">
                        <div className="rounded bg-white p-3 border border-emerald-200">
                          <span className="text-[10px] text-ink/50 block">STATUS</span>
                          <span className="text-sm font-bold text-emerald-700 mt-1 block">{preprocessDetails.status}</span>
                        </div>
                        <div className="rounded bg-white p-3 border border-emerald-200">
                          <span className="text-[10px] text-ink/50 block">ROWS PREPROCESSED</span>
                          <span className="text-sm font-bold mt-1 block">{preprocessDetails.row_count}</span>
                        </div>
                        <div className="rounded bg-white p-3 border border-emerald-200">
                          <span className="text-[10px] text-ink/50 block">IMPUTED MISSING VALUES</span>
                          <span className="text-sm font-bold mt-1 block">{preprocessDetails.missing_values}</span>
                        </div>
                        <div className="rounded bg-white p-3 border border-emerald-200">
                          <span className="text-[10px] text-ink/50 block">COLUMNS PROFILE</span>
                          <span className="text-[10px] truncate block mt-1" title={preprocessDetails.columns_found}>{preprocessDetails.columns_found || "None"}</span>
                        </div>
                      </div>
                      <div className="rounded bg-white p-3.5 border border-emerald-100 text-xs text-ink/70 leading-relaxed">
                        <span className="font-bold text-canopy block mb-1">Ingestion Cleansing Pipeline Sequence:</span>
                        Imputed missing pH values using column mean. Dropped negative rainfall outliers. Cleaned pH metrics outside standard [0.0 - 14.0] values. Preprocessed output saved to physical data storage directories.
                      </div>
                    </div>
                  )}

                  {/* Uploaded Datasets List */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">Ingested CSV Agricultural Datasets</h3>
                    {datasets.length === 0 ? (
                      <p className="text-sm text-ink/50 py-4 text-center">No CSV datasets have been uploaded or cataloged.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-canopy/10">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-canopy text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Filename</th>
                              <th className="px-4 py-3 font-semibold">Physical File Size</th>
                              <th className="px-4 py-3 font-semibold">Pipeline Status</th>
                              <th className="px-4 py-3 font-semibold">Row Count</th>
                              <th className="px-4 py-3 font-semibold">Missing Values</th>
                              <th className="px-4 py-3 font-semibold">Columns Cataloged</th>
                              <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datasets.map((d) => (
                              <tr key={d.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                                <td className="px-4 py-3 font-bold text-canopy flex items-center gap-2">
                                  <FileText className="h-4.5 w-4.5 text-soil shrink-0" />
                                  {d.filename}
                                </td>
                                <td className="px-4 py-3 text-ink/75 font-mono text-xs">{(d.file_size / 1024).toFixed(2)} KB</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    d.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                                    d.status === "Failed" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {d.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-ink/80 font-bold">{d.row_count}</td>
                                <td className="px-4 py-3 text-ink/75">{d.missing_values}</td>
                                <td className="px-4 py-3 text-xs text-ink/65 max-w-[200px] truncate" title={d.columns_found}>{d.columns_found || "-"}</td>
                                <td className="px-4 py-3 flex justify-center gap-2">
                                  <button
                                    onClick={() => setPreprocessDetails(d)}
                                    className="p-1.5 rounded bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 text-xs font-bold"
                                    title="View statistics"
                                  >
                                    View Pipeline
                                  </button>
                                  <button
                                    onClick={() => deleteDataset(d.id)}
                                    className="p-1.5 rounded bg-rose-50 text-rose-800 transition hover:bg-rose-100"
                                    title="Remove dataset"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: ADMIN USER MANAGEMENT */}
              {activeTab === "admin" && currentUser?.role === "Admin" && (
                <div className="space-y-6">
                  {/* System Statistics */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-amber-300 bg-amber-50/20 p-5 shadow-xs">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Total Users Registered</span>
                      <h4 className="text-3xl font-extrabold text-amber-900 mt-1">{adminUsers.length}</h4>
                    </div>
                    <div className="rounded-xl border border-amber-300 bg-amber-50/20 p-5 shadow-xs">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Server Architecture</span>
                      <h4 className="text-xl font-extrabold text-amber-900 mt-2 font-mono">FastAPI REST + SQLite</h4>
                    </div>
                    <div className="rounded-xl border border-amber-300 bg-amber-50/20 p-5 shadow-xs">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Pipeline Directories</span>
                      <h4 className="text-sm font-extrabold text-amber-900 mt-2 font-mono">data/raw/ &amp; processed/</h4>
                    </div>
                  </div>

                  {/* Registered Users Table */}
                  <div className="rounded-xl border border-canopy/10 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-canopy mb-4">YieldSense Registered Accounts</h3>
                    <div className="overflow-x-auto rounded-lg border border-canopy/10">
                      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                        <thead className="bg-canopy text-white">
                          <tr>
                            <th className="px-4 py-3 font-semibold">User ID</th>
                            <th className="px-4 py-3 font-semibold">Email Address</th>
                            <th className="px-4 py-3 font-semibold">Access Role</th>
                            <th className="px-4 py-3 font-semibold">Registered At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((u) => (
                            <tr key={u.id} className="border-t border-canopy/10 odd:bg-field/40 hover:bg-field/70 transition">
                              <td className="px-4 py-3 text-mono text-xs font-mono text-ink/60">#{u.id}</td>
                              <td className="px-4 py-3 font-bold text-canopy">{u.email}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  u.role === "Admin" ? "bg-amber-100 text-amber-900" :
                                  u.role === "Agriculture Expert" ? "bg-blue-100 text-blue-900" : "bg-emerald-100 text-emerald-900"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-ink/70 text-xs font-mono">{new Date(u.created_at || Date.now()).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

