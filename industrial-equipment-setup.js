// Industrial Equipment Setup Script
// Run this in your browser console on the Ingest page

const industrialEquipment = [
  // Production Line Equipment (Main Floor - Y: 0)
  { name: "Assembly Line Conveyor", posX: 0, posZ: 0, description: "Main production conveyor belt" },
  { name: "Robotic Welding Station", posX: 15, posZ: 0, description: "Automated welding robot with safety cage" },
  { name: "Quality Control Station", posX: 30, posZ: 0, description: "Inspection table with measurement tools" },
  { name: "Packaging Station", posX: 45, posZ: 0, description: "Automated packaging and labeling" },
  
  // Machine Tools (Left Side - Y: 0)
  { name: "CNC Lathe", posX: -20, posZ: 15, description: "Computer-controlled lathe for precision turning" },
  { name: "Vertical Milling Machine", posX: -20, posZ: 30, description: "3-axis milling machine for complex parts" },
  { name: "Drill Press", posX: -20, posZ: 45, description: "Heavy-duty drilling station" },
  { name: "Band Saw", posX: -20, posZ: 60, description: "Metal cutting band saw" },
  
  // Power & Control (Right Side - Y: 0)
  { name: "Electrical Panel", posX: 20, posZ: 15, description: "Main electrical distribution panel" },
  { name: "PLC Control Cabinet", posX: 20, posZ: 30, description: "Programmable Logic Controller cabinet" },
  { name: "Compressed Air Station", posX: 20, posZ: 45, description: "Air compressor and distribution system" },
  { name: "Hydraulic Power Unit", posX: 20, posZ: 60, description: "Hydraulic pump and control valves" },
  
  // Material Handling (Back Area - Y: 0)
  { name: "Forklift Charging Station", posX: -10, posZ: 80, description: "Electric forklift charging and maintenance" },
  { name: "Raw Material Storage", posX: 0, posZ: 80, description: "Steel, aluminum, and other materials" },
  { name: "Finished Goods Warehouse", posX: 10, posZ: 80, description: "Completed products storage area" },
  { name: "Scrap Metal Bin", posX: 20, posZ: 80, description: "Recycling collection point" },
  
  // Safety Equipment (Strategic Locations)
  { name: "Emergency Stop Station", posX: 0, posZ: 10, description: "Emergency shutdown controls" },
  { name: "Fire Extinguisher", posX: -15, posZ: 25, description: "Class ABC fire extinguisher" },
  { name: "First Aid Station", posX: 15, posZ: 25, description: "Medical supplies and emergency contact" },
  { name: "Safety Shower", posX: 0, posZ: 70, description: "Emergency eyewash and shower station" },
  
  // Smart Factory Equipment (Modern Additions)
  { name: "IoT Sensor Hub", posX: 5, posZ: 40, description: "Internet of Things sensor network" },
  { name: "Digital Twin Display", posX: -5, posZ: 40, description: "Real-time factory monitoring screen" },
  { name: "Predictive Maintenance Station", posX: 0, posZ: 50, description: "AI-powered equipment health monitoring" },
  { name: "Augmented Reality Workstation", posX: 10, posZ: 50, description: "AR-assisted assembly and training" }
];

console.log('Industrial Equipment Setup Script Loaded!');
console.log('Total machines to add:', industrialEquipment.length);

// Function to add a single machine
async function addMachine(machine) {
  try {
    const API_BASE_URL = window.location.origin.includes('localhost') 
      ? 'http://localhost:8787' 
      : 'http://localhost:8787';
    
    const response = await fetch(`${API_BASE_URL}/api/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: machine.name,
        posX: machine.posX,
        posZ: machine.posZ
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Added: ${machine.name} at (${machine.posX}, ${machine.posZ})`);
      return data;
    } else {
      const error = await response.json();
      console.error(`❌ Failed to add ${machine.name}:`, error.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error adding ${machine.name}:`, error);
    return null;
  }
}

// Function to add all machines
async function addAllMachines() {
  console.log('🚀 Starting to add all industrial equipment...');
  
  for (let i = 0; i < industrialEquipment.length; i++) {
    const machine = industrialEquipment[i];
    console.log(`📦 Adding ${i + 1}/${industrialEquipment.length}: ${machine.name}`);
    
    await addMachine(machine);
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🎉 All machines added! Check your Ingest page to see them.');
}

// Function to add machines in batches
async function addMachinesInBatches(batchSize = 5) {
  console.log(`🚀 Adding machines in batches of ${batchSize}...`);
  
  for (let i = 0; i < industrialEquipment.length; i += batchSize) {
    const batch = industrialEquipment.slice(i, i + batchSize);
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}: Adding ${batch.length} machines`);
    
    const promises = batch.map(machine => addMachine(machine));
    await Promise.all(promises);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All machines added in batches!');
}

// Make functions available globally
window.addMachine = addMachine;
window.addAllMachines = addAllMachines;
window.addMachinesInBatches = addMachinesInBatches;
window.industrialEquipment = industrialEquipment;

console.log('Available functions:');
console.log('- addMachine(machine) - Add a single machine');
console.log('- addAllMachines() - Add all machines sequentially');
console.log('- addMachinesInBatches(batchSize) - Add machines in batches');
console.log('- industrialEquipment - Array of all equipment data');
