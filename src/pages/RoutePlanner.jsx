import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  MapPin, 
  Navigation, 
  Search,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Custom icons for markers
const startIcon = new L.Icon({
  iconUrl: 
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34]
})

const endIcon = new L.Icon({
  iconUrl: 
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34]
})

// Carbon emissions per km (kg CO2)
const EMISSIONS = {
  walking: 0,
  cycling: 0,
  metro: 0.041,
  bus: 0.089,
  auto: 0.108,
  car: 0.171
}

// Cost per km (₹)
const COSTS = {
  walking: 0,
  cycling: 0,
  metro: 4,
  bus: 3,
  auto: 12,
  car: 15  // Includes fuel + maintenance
}

// Component to fit map to route
const FitBounds = ({ origin, destination }) => {
  const map = useMap()
  
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([
        origin, 
        destination
      ])
      map.fitBounds(bounds, { 
        padding: [50, 50] 
      })
    }
  }, [origin, destination, map])
  
  return null
}

const RoutePlanner = () => {
  const [originText, setOriginText] = useState('')
  const [destText, setDestText] = useState('')
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] 
    = useState(null)
  const [routes, setRoutes] = useState([])
  const [routePath, setRoutePath] = useState([])
  const [distance, setDistance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] 
    = useState(null)
  
  // Default to India center
  const [mapCenter] = useState([20.5937, 78.9629])

  // Search ANY location worldwide
  const searchLocation = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name
        }
      }
      return null
    } catch (error) {
      console.error('Search error:', error)
      return null
    }
  }

  // Calculate route
  const calculateRoute = async () => {
    if (!originText || !destText) {
      toast.error('Please enter both locations')
      return
    }

    setLoading(true)
    setSelectedRoute(null)

    try {
      toast.loading('Finding locations...', 
        { id: 'route' })
      
      const originData = await searchLocation(originText)
      const destData = await searchLocation(destText)

      if (!originData) {
        toast.error(
          'Could not find: ' + originText, 
          { id: 'route' }
        )
        setLoading(false)
        return
      }

      if (!destData) {
        toast.error(
          'Could not find: ' + destText, 
          { id: 'route' }
        )
        setLoading(false)
        return
      }

      setOrigin([originData.lat, originData.lng])
      setDestination([destData.lat, destData.lng])

      toast.loading('Calculating route...', 
        { id: 'route' })

      // Get route from FREE OSRM API
      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${originData.lng},${originData.lat};` +
        `${destData.lng},${destData.lat}` +
        `?overview=full&geometries=geojson`
      )

      const routeData = await routeResponse.json()

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0]
        
        const distanceKm = route.distance / 1000
        setDistance(distanceKm)

        const coords = route.geometry.coordinates.map(
          c => [c[1], c[0]]
        )
        setRoutePath(coords)

        const durationMin = Math.round(
          route.duration / 60
        )

        // Calculate all transport modes
        const allRoutes = [
          {
            mode: 'Walking',
            icon: '🚶',
            distance: distanceKm.toFixed(1),
            duration: 
              `${Math.round(distanceKm * 12)} min`,
            carbon: 0,
            cost: 0,
            color: '#22C55E',
            bgColor: '#F0FDF4',
            label: 'BEST CHOICE 🌱',
            rating: 5,
            tip: 'Best for health & environment!'
          },
          {
            mode: 'Cycling',
            icon: '🚴',
            distance: distanceKm.toFixed(1),
            duration: 
              `${Math.round(distanceKm * 3)} min`,
            carbon: 0,
            cost: 0,
            color: '#22C55E',
            bgColor: '#F0FDF4',
            label: 'ZERO EMISSIONS',
            rating: 5,
            tip: 'Free exercise + zero pollution!'
          },
          {
            mode: 'Metro',
            icon: '🚇',
            distance: distanceKm.toFixed(1),
            duration: 
              `${Math.round(distanceKm * 4)} min`,
            carbon: (distanceKm * EMISSIONS.metro)
              .toFixed(2),
            cost: Math.round(distanceKm * COSTS.metro),
            color: '#8B5CF6',
            bgColor: '#FAF5FF',
            label: 'EFFICIENT',
            rating: 4,
            tip: 'Fast and eco-friendly!'
          },
          {
            mode: 'Bus',
            icon: '🚌',
            distance: (distanceKm * 1.2).toFixed(1),
            duration: 
              `${Math.round(distanceKm * 5)} min`,
            carbon: (distanceKm * EMISSIONS.bus)
              .toFixed(2),
            cost: Math.round(distanceKm * COSTS.bus),
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            label: 'LOW CARBON',
            rating: 4,
            tip: 'Cheapest public transport!'
          },
          {
            mode: 'Auto Rickshaw',
            icon: '🛺',
            distance: distanceKm.toFixed(1),
            duration: `${durationMin} min`,
            carbon: (distanceKm * EMISSIONS.auto)
              .toFixed(2),
            cost: Math.round(distanceKm * COSTS.auto),
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            label: 'MEDIUM CARBON',
            rating: 3,
            tip: 'Convenient for short trips'
          },
          {
            mode: 'Car',
            icon: '🚗',
            distance: distanceKm.toFixed(1),
            duration: `${durationMin} min`,
            carbon: (distanceKm * EMISSIONS.car)
              .toFixed(2),
            cost: Math.round(distanceKm * COSTS.car),
            color: '#EF4444',
            bgColor: '#FEF2F2',
            label: 'HIGH CARBON',
            rating: 2,
            tip: 'Consider carpooling to reduce impact'
          }
        ]

        setRoutes(allRoutes)
        toast.success(
          `Found ${distanceKm.toFixed(1)} km route!`, 
          { id: 'route' }
        )
      } else {
        toast.error('No route found', { id: 'route' })
      }

    } catch (error) {
      console.error(error)
      toast.error(
        'Could not calculate route. Try again.', 
        { id: 'route' }
      )
    } finally {
      setLoading(false)
    }
  }

  // Save chosen route to database
  const saveRoute = async (route) => {
    try {
      const { data: { user: authUser } } 
        = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please login first')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()

      if (!profile) return

      await supabase
        .from('carbon_logs')
        .insert({
          user_id: profile.id,
          category: 'transport',
          activity_name: 
            `${route.mode}: ${originText} → ${destText}`,
          activity_icon: route.icon,
          carbon_kg: parseFloat(route.carbon)
        })

      const carCarbon = parseFloat(routes[5].carbon)
      const carCost = routes[5].cost
      const saved = carCarbon - parseFloat(route.carbon)
      const moneySaved = carCost - route.cost

      setSelectedRoute(route)

      if (saved > 0) {
        toast.success(
          `🎉 Saved ${saved.toFixed(2)} kg CO₂ and ₹${moneySaved}!`
        )
      } else {
        toast.success('Route saved! 🌿')
      }

    } catch (error) {
      toast.error('Failed to save route')
    }
  }

  // Calculate impact (Feature 3)
  const getImpactStats = (route) => {
    if (!route || routes.length === 0) return null
    
    const carCarbon = parseFloat(routes[5].carbon)
    const carCost = routes[5].cost
    const carbonSaved = carCarbon - parseFloat(route.carbon)
    const moneySaved = carCost - route.cost
    
    return {
      carbonSaved: carbonSaved.toFixed(2),
      moneySaved: moneySaved,
      treesEquivalent: (carbonSaved / 22).toFixed(3),
      phonesCharged: Math.round(carbonSaved * 71),
      ledHours: Math.round(carbonSaved * 8),
      kmAvoided: parseFloat(routes[5].distance)
    }
  }

  return (
    <div className="p-8">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 
          flex items-center gap-2">
          🗺️ Green Route Planner
        </h1>
        <p className="text-gray-600">
          Find the eco-friendliest way to travel anywhere!
        </p>
        <p className="text-sm text-green-600 mt-1">
          ✨ Works for ANY location worldwide
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl 
          shadow-sm p-6 mb-6"
      >
        <div className="grid grid-cols-1 
          md:grid-cols-2 gap-4 mb-4">
          
          <div>
            <label className="block text-sm 
              font-medium text-gray-700 mb-2 
              flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              From (Starting Location)
            </label>
            <input
              type="text"
              placeholder="e.g., Pune Station, Mumbai Airport, IIT Delhi..."
              value={originText}
              onChange={(e) => 
                setOriginText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && destText) {
                  calculateRoute()
                }
              }}
              className="w-full px-4 py-3 
                bg-gray-50 rounded-xl 
                focus:outline-none 
                focus:ring-2 
                focus:ring-green-500
                border border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm 
              font-medium text-gray-700 mb-2 
              flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-600" />
              To (Destination)
            </label>
            <input
              type="text"
              placeholder="e.g., Goa Beach, Taj Mahal, MG Road..."
              value={destText}
              onChange={(e) => 
                setDestText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && originText) {
                  calculateRoute()
                }
              }}
              className="w-full px-4 py-3 
                bg-gray-50 rounded-xl 
                focus:outline-none 
                focus:ring-2 
                focus:ring-green-500
                border border-gray-200"
            />
          </div>
        </div>

        <button
          onClick={calculateRoute}
          disabled={loading}
          className="w-full py-3 
            bg-gradient-to-r from-green-600 
            to-green-700 text-white 
            font-semibold rounded-xl 
            hover:shadow-lg transition-all 
            disabled:opacity-50 
            flex items-center justify-center 
            gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full 
                h-5 w-5 border-b-2 border-white">
              </div>
              Calculating...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Find Green Routes
            </>
          )}
        </button>

        {/* Quick suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-sm text-gray-500 w-full mb-1">
            💡 Quick examples:
          </p>
          <button
            onClick={() => {
              setOriginText('Connaught Place, Delhi')
              setDestText('India Gate, Delhi')
            }}
            className="text-xs px-3 py-1 
              bg-gray-100 rounded-full 
              hover:bg-gray-200"
          >
            🏛️ Delhi tour
          </button>
          <button
            onClick={() => {
              setOriginText('Pune Station')
              setDestText('Mumbai Airport')
            }}
            className="text-xs px-3 py-1 
              bg-gray-100 rounded-full 
              hover:bg-gray-200"
          >
            🚆 Pune to Mumbai
          </button>
          <button
            onClick={() => {
              setOriginText('Bangalore')
              setDestText('Mysore')
            }}
            className="text-xs px-3 py-1 
              bg-gray-100 rounded-full 
              hover:bg-gray-200"
          >
            🏙️ Bangalore to Mysore
          </button>
        </div>
      </motion.div>

      {/* Map and Routes */}
      <div className="grid grid-cols-1 
        lg:grid-cols-5 gap-6">
        
        {/* Map (Feature 1) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-2xl 
            shadow-sm p-4 overflow-hidden">
            <div className="mb-3 flex items-center 
              justify-between">
              <h3 className="font-bold text-lg">
                🗺️ Interactive Map
              </h3>
              {distance > 0 && (
                <div className="text-sm text-gray-600">
                  Distance: <span className="font-bold 
                    text-green-600">
                    {distance.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
            
            <MapContainer 
              center={mapCenter}
              zoom={5}
              style={{ 
                height: '500px', 
                width: '100%',
                borderRadius: '12px'
              }}
            >
              <TileLayer
                attribution='© OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {origin && (
                <Marker position={origin} icon={startIcon}>
                  <Popup>
                    <div className="text-center">
                      <strong>📍 Start</strong>
                      <br />
                      {originText}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {destination && (
                <Marker position={destination} icon={endIcon}>
                  <Popup>
                    <div className="text-center">
                      <strong>📌 Destination</strong>
                      <br />
                      {destText}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {routePath.length > 0 && (
                <Polyline 
                  positions={routePath}
                  color="#22C55E"
                  weight={5}
                  opacity={0.8}
                />
              )}
              
              {origin && destination && (
                <FitBounds 
                  origin={origin} 
                  destination={destination} 
                />
              )}
            </MapContainer>
          </div>
        </motion.div>

        {/* Route Options */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-3 
            max-h-[600px] overflow-y-auto pr-2"
        >
          {routes.length === 0 ? (
            <div className="bg-white rounded-2xl 
              p-12 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium">
                Ready to plan your green route?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Enter any two locations to begin
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-lg mb-2">
                ✨ Transport Options
              </h3>
              {routes.map((route, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl 
                    border-2 cursor-pointer 
                    hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: route.bgColor,
                    borderColor: route.color
                  }}
                  onClick={() => saveRoute(route)}
                >
                  <div className="flex justify-between 
                    items-start mb-2">
                    <div className="flex items-center 
                      gap-3">
                      <div className="text-3xl">
                        {route.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {route.mode}
                        </h3>
                        <span 
                          className="text-xs font-bold 
                            px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: route.color,
                            color: 'white'
                          }}
                        >
                          {route.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold"
                        style={{ color: route.color }}>
                        {route.carbon}
                      </div>
                      <div className="text-xs text-gray-500">
                        kg CO₂
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between 
                    text-sm text-gray-600 mt-3">
                    <span className="flex items-center gap-1">
                      📏 {route.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {route.duration}
                    </span>
                    <span className="flex items-center gap-1 
                      font-bold">
                      ₹{route.cost}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 
                      rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{
                          width: 
                            `${(route.carbon / 5) * 100}%`,
                          backgroundColor: route.color
                        }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 italic">
                    💡 {route.tip}
                  </p>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>

      {/* Impact Calculator (Feature 3) */}
      {selectedRoute && routes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 
            bg-gradient-to-br from-green-50 via-emerald-50 
            to-teal-50 rounded-2xl border-2 
            border-green-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-xl font-bold">
                Amazing Choice!
              </h3>
              <p className="text-sm text-gray-600">
                Your impact by choosing {selectedRoute.mode}
              </p>
            </div>
          </div>

          {(() => {
            const stats = getImpactStats(selectedRoute)
            if (!stats) return null

            return (
              <>
                {/* Main savings */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl 
                    border-2 border-green-300">
                    <div className="text-sm text-gray-600 mb-1">
                      💨 CO₂ Saved
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {stats.carbonSaved} kg
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      vs taking a car
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl 
                    border-2 border-blue-300">
                    <div className="text-sm text-gray-600 mb-1">
                      💰 Money Saved
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{stats.moneySaved}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      vs car fuel cost
                    </div>
                  </div>
                </div>

                {/* Equivalent impacts */}
                <div className="bg-white p-5 rounded-xl">
                  <h4 className="font-bold mb-3 text-gray-800">
                    🌍 Your Carbon Savings Equal To:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌳</div>
                      <div className="text-lg font-bold text-green-600">
                        {stats.treesEquivalent}
                      </div>
                      <div className="text-xs text-gray-500">
                        trees planted
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <div className="text-lg font-bold text-blue-600">
                        {stats.phonesCharged}
                      </div>
                      <div className="text-xs text-gray-500">
                        phones charged
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl mb-2">💡</div>
                      <div className="text-lg font-bold text-yellow-600">
                        {stats.ledHours}
                      </div>
                      <div className="text-xs text-gray-500">
                        hours of LED bulb
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl mb-2">🚗</div>
                      <div className="text-lg font-bold text-red-600">
                        {stats.kmAvoided} km
                      </div>
                      <div className="text-xs text-gray-500">
                        of car driving avoided
                      </div>
                    </div>

                  </div>
                </div>

                {/* Yearly projection */}
                <div className="mt-4 p-4 
                  bg-gradient-to-r from-purple-100 to-pink-100 
                  rounded-xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-bold text-gray-800">
                        If you choose this daily for a year:
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        You would save <span className="font-bold text-green-600">
                          {(stats.carbonSaved * 365).toFixed(0)} kg CO₂
                        </span>
                        {' '}and <span className="font-bold text-blue-600">
                          ₹{(stats.moneySaved * 365).toLocaleString()}
                        </span>!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement badge */}
                <div className="mt-4 flex items-center 
                  justify-center gap-2 
                  bg-yellow-50 p-3 rounded-xl 
                  border-2 border-yellow-200">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <span className="font-bold text-yellow-700">
                    Eco-Hero Choice! 🏆
                  </span>
                </div>
              </>
            )
          })()}
        </motion.div>
      )}

      {/* General Tips when no route selected */}
      {routes.length > 0 && !selectedRoute && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 
            bg-gradient-to-r from-blue-50 to-cyan-50 
            rounded-2xl border-2 border-blue-200"
        >
          <h3 className="text-xl font-bold mb-2 
            flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Quick Comparison
          </h3>
          <p className="text-gray-700 mb-4">
            Click any option above to save it and see 
            detailed impact!
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 
              bg-white rounded-xl">
              <div className="text-2xl mb-1">🌱</div>
              <div className="text-sm font-bold">
                Greenest Option
              </div>
              <div className="text-xs text-green-600">
                Walking/Cycling
              </div>
            </div>
            <div className="text-center p-3 
              bg-white rounded-xl">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm font-bold">
                Cheapest Option
              </div>
              <div className="text-xs text-blue-600">
                Bus (₹{routes[3]?.cost})
              </div>
            </div>
            <div className="text-center p-3 
              bg-white rounded-xl">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm font-bold">
                Fastest Eco Option
              </div>
              <div className="text-xs text-purple-600">
                Metro
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RoutePlanner
