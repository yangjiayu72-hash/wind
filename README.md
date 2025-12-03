# 3D Particle Wind System

An interactive 3D visualization featuring particle-like objects with net-like structures that respond to user-controlled wind.

## Features

- **Black Space Environment**: Minimalist black background for focus on particles
- **Net-like 3D Particles**: 15 wireframe icosahedron meshes creating a net-like appearance
- **Regular Movement**: Particles float and rotate smoothly when no input is detected
- **Wind Control**: Use arrow keys to control wind direction
- **Dynamic Deformation**: Particle nets deform and move based on wind forces
- **Physics Simulation**: Realistic mass-based physics for particle movement

## Controls

- **Arrow Up**: Wind blows upward
- **Arrow Down**: Wind blows downward
- **Arrow Left**: Wind blows left
- **Arrow Right**: Wind blows right
- **No Input**: Particles return to regular gentle movement

## How to Run

1. Open `index.html` in a modern web browser
2. The visualization will start automatically
3. Use arrow keys to control the wind and watch the particles react

## Technical Details

- Built with Three.js (r128)
- Uses icosahedron geometry with wireframe rendering
- Vertex deformation based on wind direction and magnitude
- Smooth transitions between wind-controlled and regular states
- Automatic camera orbit for enhanced viewing

## Implementation Highlights

- Each particle has individual mass and velocity properties
- Wind force calculations based on particle mass
- Vertex deformation on windward side of particles
- Gradual shape restoration when wind stops
- Boundary detection to keep particles in view
