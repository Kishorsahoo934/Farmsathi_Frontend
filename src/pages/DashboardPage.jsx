import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { to: '/crop-recommend', icon: '🌱', title: 'Crop Recommendation', desc: 'AI-powered crop suggestions based on soil & weather parameters.', color: '#2e7d32' },
  { to: '/fertilizer-recommend', icon: '🧪', title: 'Fertilizer Recommendation', desc: 'Optimal fertilizer mix tailored to your soil and crop type.', color: '#1565c0' },
  { to: '/disease-detect', icon: '🔬', title: 'Crop Disease Detection', desc: 'Upload leaf images to identify diseases and get a treatment PDF.', color: '#e53935' },
];

const stats = [
  { label: 'Crops Supported', value: '22+', icon: '🌾' },
  { label: 'Disease Classes', value: '38+', icon: '🦠' },
  { label: 'Fertilizers', value: '7', icon: '🧪' },
  { label: 'AI Models', value: '3', icon: '🤖' },
];

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const MANDI_DATA = {
  "delhi": {
    name: "Azadpur Mandi - Delhi",
    crops: {
      wheat: { name: "Wheat / गेहूं", price: 2350, change: 1.5, prev: 2315, trend: [2200, 2250, 2280, 2310, 2315, 2350], unit: "Quintal" },
      paddy: { name: "Paddy / धान", price: 2180, change: -0.8, prev: 2197, trend: [2100, 2150, 2190, 2210, 2197, 2180], unit: "Quintal" },
      potato: { name: "Potato / आलू", price: 1450, change: 4.2, prev: 1390, trend: [1200, 1250, 1310, 1360, 1390, 1450], unit: "Quintal" },
      onion: { name: "Onion / प्याज", price: 2800, change: -2.1, prev: 2860, trend: [3200, 3100, 2950, 2900, 2860, 2800], unit: "Quintal" },
      tomato: { name: "Tomato / टमाटर", price: 3200, change: 8.5, prev: 2950, trend: [1800, 2000, 2400, 2600, 2950, 3200], unit: "Quintal" },
      mustard: { name: "Mustard / सरसों", price: 5450, change: 0.3, prev: 5434, trend: [5200, 5300, 5350, 5400, 5434, 5450], unit: "Quintal" }
    }
  },
  "mumbai": {
    name: "Vashi Mandi - Mumbai",
    crops: {
      wheat: { name: "Wheat / गेहूं", price: 2420, change: 0.8, prev: 2400, trend: [2300, 2340, 2360, 2380, 2400, 2420], unit: "Quintal" },
      paddy: { name: "Paddy / धान", price: 2250, change: 1.2, prev: 2223, trend: [2150, 2180, 2200, 2210, 2223, 2250], unit: "Quintal" },
      potato: { name: "Potato / आलू", price: 1600, change: 3.1, prev: 1552, trend: [1400, 1450, 1480, 1520, 1552, 1600], unit: "Quintal" },
      onion: { name: "Onion / प्याज", price: 2950, change: -1.5, prev: 2995, trend: [3300, 3200, 3100, 3050, 2995, 2950], unit: "Quintal" },
      tomato: { name: "Tomato / टमाटर", price: 3500, change: 6.2, prev: 3295, trend: [2000, 2200, 2600, 3000, 3295, 3500], unit: "Quintal" },
      mustard: { name: "Mustard / सरसों", price: 5600, change: -0.5, prev: 5628, trend: [5400, 5500, 5550, 5600, 5628, 5600], unit: "Quintal" }
    }
  },
  "indore": {
    name: "Indore Mandi - MP",
    crops: {
      wheat: { name: "Wheat / गेहूं", price: 2310, change: 2.1, prev: 2262, trend: [2150, 2200, 2220, 2240, 2262, 2310], unit: "Quintal" },
      paddy: { name: "Paddy / धान", price: 2120, change: -1.4, prev: 2150, trend: [2050, 2080, 2110, 2130, 2150, 2120], unit: "Quintal" },
      potato: { name: "Potato / आलू", price: 1350, change: 5.0, prev: 1285, trend: [1100, 1150, 1200, 1250, 1285, 1350], unit: "Quintal" },
      onion: { name: "Onion / प्याज", price: 2600, change: -3.0, prev: 2680, trend: [3000, 2900, 2800, 2750, 2680, 2600], unit: "Quintal" },
      tomato: { name: "Tomato / टमाटर", price: 2800, change: 12.0, prev: 2500, trend: [1500, 1700, 2000, 2200, 2500, 2800], unit: "Quintal" },
      mustard: { name: "Mustard / सरसों", price: 5300, change: 0.9, prev: 5252, trend: [5100, 5150, 5200, 5230, 5252, 5300], unit: "Quintal" }
    }
  },
  "kanpur": {
    name: "Kanpur Mandi - UP",
    crops: {
      wheat: { name: "Wheat / गेहूं", price: 2280, change: 1.1, prev: 2255, trend: [2180, 2200, 2220, 2240, 2255, 2280], unit: "Quintal" },
      paddy: { name: "Paddy / धान", price: 2150, change: -0.5, prev: 2160, trend: [2080, 2100, 2130, 2150, 2160, 2150], unit: "Quintal" },
      potato: { name: "Potato / आलू", price: 1280, change: 2.4, prev: 1250, trend: [1050, 1100, 1150, 1200, 1250, 1280], unit: "Quintal" },
      onion: { name: "Onion / प्याज", price: 2700, change: -1.8, prev: 2750, trend: [2900, 2850, 2800, 2780, 2750, 2700], unit: "Quintal" },
      tomato: { name: "Tomato / टमाटर", price: 3000, change: 9.1, prev: 2750, trend: [1600, 1800, 2200, 2400, 2750, 3000], unit: "Quintal" },
      mustard: { name: "Mustard / सरसों", price: 5350, change: 0.5, prev: 5323, trend: [5150, 5200, 5250, 5300, 5323, 5350], unit: "Quintal" }
    }
  }
};

const getAdvisory = (cropName, trend) => {
  const current = trend[trend.length - 1];
  const average = trend.reduce((a, b) => a + b, 0) / trend.length;
  
  if (current > average * 1.04) {
    return {
      type: "sell",
      icon: "🟢",
      badge: "sell",
      title: "Strong Sell Advice / बेचने की सलाह",
      subtitle: "Prices are at a seasonal peak",
      advice: `Prices for ${cropName.split('/')[0].trim()} are currently ₹${current}/Quintal, which is higher than the 6-month average. It is highly recommended to sell your harvest now to secure maximum profits.`,
      points: [
        "Take advantage of current high demand.",
        "Store only if you have certified cold storage.",
        "Expect slight price drop next month as new harvest arrives."
      ]
    };
  } else if (current < average * 0.96) {
    return {
      type: "hold",
      icon: "🟡",
      badge: "hold",
      title: "Hold Stock Advice / रोकने की सलाह",
      subtitle: "Prices are at a seasonal low",
      advice: `Prices for ${cropName.split('/')[0].trim()} are currently ₹${current}/Quintal. This is a seasonal low due to high market arrivals. If possible, hold your stock for 4-6 weeks to sell at a better rate.`,
      points: [
        "Ensure grain/produce is dried to safe moisture levels (below 12%).",
        "Keep produce protected from moisture and pests.",
        "Prices are projected to recover by ₹150-250 per quintal."
      ]
    };
  } else {
    return {
      type: "hold",
      icon: "🔵",
      badge: "hold",
      title: "Stable Market Advice / सामान्य बाजार",
      subtitle: "Prices are stable",
      advice: `Market prices for ${cropName.split('/')[0].trim()} are currently stable around ₹${current}/Quintal. There are no major fluctuations expected in the short term.`,
      points: [
        "Plan your sales in batches to reduce risk.",
        "Monitor weather forecasts for sudden crop damage impacts.",
        "Sell as per your financial needs."
      ]
    };
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Farmer';

  const [selectedMandi, setSelectedMandi] = useState("delhi");
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const mandiCrops = MANDI_DATA[selectedMandi].crops;
  const currentCropInfo = mandiCrops[selectedCrop];
  const trend = currentCropInfo.trend;

  // Chart configuration
  const minVal = Math.min(...trend);
  const maxVal = Math.max(...trend);
  const valRange = maxVal - minVal || 1;
  const yMin = minVal - valRange * 0.15;
  const yMax = maxVal + valRange * 0.15;
  const yRange = yMax - yMin;

  const paddingLeft = 48;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;
  const chartWidth = 500 - paddingLeft - paddingRight;
  const chartHeight = 220 - paddingTop - paddingBottom;

  const points = trend.map((v, i) => {
    const x = paddingLeft + (i / (trend.length - 1)) * chartWidth;
    const y = 220 - paddingBottom - ((v - yMin) / yRange) * chartHeight;
    return { x, y, value: v, month: MONTHS[i] };
  });

  const linePath = points.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, "");

  const areaPath = linePath + ` L ${points[points.length - 1].x} ${220 - paddingBottom} L ${points[0].x} ${220 - paddingBottom} Z`;

  const gridLines = [
    yMin + yRange * 0.25,
    yMin + yRange * 0.5,
    yMin + yRange * 0.75
  ];

  const advisory = getAdvisory(currentCropInfo.name, trend);

  return (
    <div className="db-wrapper">
      {/* Hero greeting */}
      <div className="db-hero">
        <div className="db-hero-content">
          <p className="db-greeting">Welcome back,</p>
          <h1 className="db-name">{firstName} 👋</h1>
          <p className="db-subtitle">Your smart farming dashboard — powered by AI</p>
        </div>
        <div className="db-hero-badge">🌾</div>
      </div>

      {/* Stats row */}
      <div className="db-stats-row">
        {stats.map((s) => (
          <div className="db-stat-card" key={s.label}>
            <span className="db-stat-icon">{s.icon}</span>
            <span className="db-stat-value">{s.value}</span>
            <span className="db-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mandi Insights Dashboard */}
      <div className="mandi-section">
        <div className="mandi-header">
          <div className="mandi-title">
            <h2>🌾 Mandi Insights & Prices</h2>
            <span>मंडी भाव और बाजार की जानकारी</span>
          </div>
          <div className="mandi-selector-wrapper">
            <span className="mandi-selector-label">Market / मंडी:</span>
            <select 
              className="mandi-select" 
              value={selectedMandi} 
              onChange={(e) => {
                setSelectedMandi(e.target.value);
                setHoveredPoint(null);
              }}
            >
              {Object.keys(MANDI_DATA).map(key => (
                <option key={key} value={key}>{MANDI_DATA[key].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Crops Grid */}
        <div className="mandi-grid">
          {Object.keys(mandiCrops).map(cropKey => {
            const crop = mandiCrops[cropKey];
            const isUp = crop.change >= 0;
            const isActive = selectedCrop === cropKey;
            
            const cropIcons = {
              wheat: "🌾",
              paddy: "🌾",
              potato: "🥔",
              onion: "🧅",
              tomato: "🍅",
              mustard: "🌱"
            };

            return (
              <div 
                key={cropKey} 
                className={`mandi-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCrop(cropKey);
                  setHoveredPoint(null);
                }}
              >
                <span className="mandi-card-icon">{cropIcons[cropKey] || "🌾"}</span>
                <span className="mandi-card-name">{crop.name}</span>
                <span className="mandi-card-price">
                  ₹{crop.price} <span>/{crop.unit}</span>
                </span>
                <span className={`mandi-card-change ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(crop.change)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart & Advisory Section */}
        <div className="mandi-chart-wrapper">
          {/* Main SVG Graph */}
          <div className="mandi-chart-container">
            <div className="mandi-chart-title">
              <span>📈 {currentCropInfo.name} Price Trend (6 Months)</span>
              <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 500 }}>
                Hover points for details
              </span>
            </div>

            <div className="mandi-chart-svg-wrapper">
              <svg className="mandi-chart-svg" viewBox="0 0 500 220">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4caf50" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4caf50" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {gridLines.map((gVal, idx) => {
                  const gY = 220 - paddingBottom - ((gVal - yMin) / yRange) * chartHeight;
                  return (
                    <g key={idx}>
                      <line 
                        x1={paddingLeft} 
                        y1={gY} 
                        x2={500 - paddingRight} 
                        y2={gY} 
                        stroke="#eef2ed" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingLeft - 8} 
                        y={gY + 3} 
                        textAnchor="end" 
                        fontSize="9" 
                        fill="#888"
                      >
                        ₹{Math.round(gVal)}
                      </text>
                    </g>
                  );
                })}

                {/* X axis baseline */}
                <line 
                  x1={paddingLeft} 
                  y1={220 - paddingBottom} 
                  x2={500 - paddingRight} 
                  y2={220 - paddingBottom} 
                  stroke="#ddd" 
                  strokeWidth="1" 
                />

                {/* Area under the line */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Price Line */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#2e7d32" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredPoint?.month === p.month ? "6" : "4"} 
                      fill="#2e7d32" 
                      stroke="#fff" 
                      strokeWidth="2.5" 
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    <text 
                      x={p.x} 
                      y={220 - 10} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fontWeight="600" 
                      fill="#666"
                    >
                      {p.month}
                    </text>
                    {/* Hover hit-box */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="16" 
                      fill="transparent" 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div 
                  className="mandi-chart-tooltip" 
                  style={{ 
                    left: `${(hoveredPoint.x / 500) * 100}%`, 
                    top: `${(hoveredPoint.y / 220) * 100}%` 
                  }}
                >
                  <strong>{hoveredPoint.month}:</strong> ₹{hoveredPoint.value}
                </div>
              )}
            </div>
          </div>

          {/* Market Advisory */}
          <div className="mandi-advisory">
            <div>
              <div className="mandi-advisory-header">
                <div className={`mandi-advisory-badge ${advisory.badge}`}>
                  {advisory.icon}
                </div>
                <div className="mandi-advisory-title">
                  <h4>{advisory.title}</h4>
                  <span>{advisory.subtitle}</span>
                </div>
              </div>
              <div className="mandi-advisory-body">
                <p>{advisory.advice}</p>
                <ul>
                  {advisory.points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            </div>
            <div className="mandi-advisory-footer">
              💡 <span><strong>Tip:</strong> Crop suggestions are available under the "Crop Recommendation" tool.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <h2 className="db-section-title">🚀 Tools</h2>
      <div className="db-feature-grid">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="db-feature-card" style={{ '--card-accent': f.color }}>
            <div className="db-feature-icon">{f.icon}</div>
            <div className="db-feature-content">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
            <span className="db-feature-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Quick tip */}
      <div className="db-tip-banner">
        <span className="db-tip-icon">💡</span>
        <div>
          <strong>Pro Tip:</strong> Use the Disease Detection tool after every monsoon season to catch infections early and protect your yield.
        </div>
      </div>
    </div>
  );
}

