# XAS Sample Calculator - User Guide

## Quick Start for New Users

This guide will help you understand how to prepare samples for X-ray Absorption Spectroscopy (XAS) measurements using our calculator.

## Table of Contents
1. [What is XAS?](#what-is-xas)
2. [Understanding the Basics](#understanding-the-basics)
3. [Choosing Your Calculator Mode](#choosing-your-calculator-mode)
4. [Thin Film Calculator](#thin-film-calculator)
5. [Dilute Sample Calculator](#dilute-sample-calculator)
6. [Step-by-Step Examples](#step-by-step-examples)
7. [Tips for Success](#tips-for-success)
8. [Frequently Asked Questions](#frequently-asked-questions)

## What is XAS?

X-ray Absorption Spectroscopy (XAS) is a technique that measures how X-rays are absorbed by a material as a function of energy. It provides information about:
- Local atomic structure
- Oxidation states
- Chemical bonding
- Coordination environment

For good XAS data, your sample needs the right amount of X-ray absorption - not too much, not too little.

## Understanding the Basics

### The Key Parameter: μt

The most important parameter in XAS sample preparation is **μt** (mu-t):
- **μ** (mu) = linear absorption coefficient (how strongly the material absorbs X-rays)
- **t** = sample thickness
- **μt** = the product (dimensionless)

### Optimal μt Values

| Measurement Mode | Optimal μt | Why? |
|-----------------|------------|------|
| **Transmission** | ~1.5 | Balances signal-to-noise with absorption edge jump |
| **Fluorescence** | ~0.5 | Minimizes self-absorption while maintaining signal |

Think of it like sunglasses:
- μt too small (< 0.1) = Clear glass - no useful absorption signal
- μt optimal (0.5-1.5) = Good sunglasses - just right
- μt too large (> 3) = Welding mask - blocks too much light

## Choosing Your Calculator Mode

### When to Use Thin Film Calculator

Choose **Thin Film** mode when:
- You can make uniform thin samples
- You have pure or concentrated materials
- You're working with foils, films, or solutions
- You need to know the optimal thickness

**Example materials**: Metal foils, polymer films, concentrated solutions

### When to Use Dilute Sample Calculator

Choose **Dilute Sample** mode when:
- Your material is too absorbing for practical thin films
- You're working with powders
- You need to prepare pellets or pack capillaries
- You want to know how much sample and dilutant to mix

**Example materials**: Metal oxides, concentrated catalysts, mineral samples

## Thin Film Calculator

### Input Parameters

1. **Chemical Formula**
   - Enter the molecular formula (e.g., `Fe2O3`, `CuSO4·5H2O`)
   - Use standard chemical notation
   - Decimals allowed (e.g., `Fe0.5Ni0.5O`)

2. **Absorption Edge**
   - Format: `Element Edge` (e.g., `Fe K`, `Cu L3`)
   - Multiple edges: comma-separated (e.g., `Fe K, Ni K`)
   - The calculator uses the most restrictive edge

3. **Density**
   - Usually auto-filled from database
   - Override if you know the actual density
   - Units: g/cm³

### Understanding the Output

The calculator provides:
- **Recommended thickness** in micrometers (μm)
- **Detailed calculations** showing how the value was determined
- **Edge-specific information** for each absorption edge

## Dilute Sample Calculator

### Basic Concept

When your pure sample would need to be impossibly thin (e.g., 5 μm), you can mix it with a weakly-absorbing material (dilutant) to make a thicker, more practical sample.

### Input Parameters

#### Sample Information
1. **Sample Formula**: Your material of interest
2. **Sample Density**: Theoretical density of pure material
3. **Absorption Edges**: Same as thin film calculator

#### Dilutant Selection
1. **Choose a Dilutant**: 
   - **Boron Nitride (BN)**: Best general-purpose, chemically inert
   - **Cellulose**: Cheap, good for high-energy edges
   - **Graphite**: Conductive, good for electron-sensitive measurements
   - **Polyethylene**: Minimal absorption, hard to grind

2. **Dilutant Properties**: Auto-filled but adjustable

#### Geometry Selection

**Pellet** (pressed powder disc):
- **Diameter**: Typically 5-13 mm
- **Thickness**: Typically 0.5-2 mm
- Used in standard pellet holders

**Capillary** (powder in tube):
- **Inner Diameter**: Typically 0.5-2 mm
- **Length**: Typically 10-30 mm
- Used for air-sensitive samples or special geometries

#### Container Material

- **None**: Open holder, pellet in air
- **Kapton**: Low absorption polymer tape/windows
- **Quartz**: Glass capillaries
- **Polyimide**: Thin-walled tubing

#### Packing Factor (Critical Parameter!)

This represents how densely packed your powder is:

| Packing Factor | Preparation Method | Description |
|---------------|-------------------|-------------|
| 30-40% | Loose powder | Just poured, no compression |
| 50-60% | Tapped powder | Settled by tapping |
| 70-80% | Pressed pellet | Moderate pressure |
| 85-95% | High pressure | Hydraulic press |

**Important**: This is an estimate. For accurate results, measure your actual packing factor (see Theory document).

### Understanding the Output

The calculator provides:
1. **Required Masses**
   - Sample mass in mg
   - Dilutant mass in mg
   - Total mass (should equal sum)

2. **Preparation Instructions**
   - Step-by-step mixing protocol
   - Specific to your geometry choice
   - Includes safety considerations

3. **Warnings**
   - If masses are impractically small (< 10 mg total)
   - If dilution is extreme (< 1% or > 90% sample)

## Step-by-Step Examples

### Example 1: Iron Oxide Thin Film

**Goal**: Prepare Fe₂O₃ sample for Fe K-edge measurement

1. Select "Thin Film" mode
2. Enter:
   - Formula: `Fe2O3`
   - Edge: `Fe K`
   - Mode: Transmission
3. Result: ~15 μm thickness needed
4. **Preparation**: Grind and press into self-supporting wafer

### Example 2: Dilute Nickel Oxide Pellet

**Goal**: Prepare NiO pellet for Ni K-edge measurement

1. Select "Dilute Sample" mode
2. Enter sample info:
   - Formula: `NiO`
   - Edge: `Ni K`
   - Mode: Transmission
3. Choose dilutant: Boron Nitride
4. Set geometry:
   - Pellet: 10 mm diameter, 1 mm thick
5. Set packing: 70% (pressed pellet)
6. Results might show:
   - Sample needed: 45 mg NiO
   - Dilutant needed: 155 mg BN
   - Total: 200 mg
7. **Preparation**: 
   - Weigh materials precisely
   - Grind each separately to fine powder
   - Mix thoroughly for 10+ minutes
   - Press at consistent pressure

### Example 3: Copper Solution in Capillary

**Goal**: Prepare 1M CuSO₄ solution for Cu K-edge

1. Use Thin Film calculator first:
   - Formula: `CuSO4·5H2O` (if using hydrated)
   - Consider solution density (~1.1 g/cm³)
2. Calculate path length needed
3. Choose appropriate capillary diameter
4. Fill capillary, seal ends

## Tips for Success

### Sample Preparation Best Practices

1. **Grinding**
   - Target: < 10 μm particle size
   - Use agate mortar or ball mill
   - Check for uniformity (no visible grains)

2. **Mixing**
   - Minimum 10 minutes hand mixing
   - Better: Use ball mill or mixer mill
   - Test: No color variations visible

3. **Weighing**
   - Use analytical balance (0.1 mg precision)
   - Account for hygroscopic materials
   - Record actual masses used

4. **Pressing Pellets**
   - Note pressure used
   - Hold for consistent time (e.g., 30 seconds)
   - Check pellet integrity

### Common Pitfalls to Avoid

| Problem | Cause | Solution |
|---------|-------|----------|
| Noisy data | Sample too thin/dilute | Increase thickness or concentration |
| Distorted edge | Sample too thick | Decrease thickness or dilute more |
| Inhomogeneous signal | Poor mixing | Remix sample, longer grinding |
| Pellet breaks | Insufficient pressure | Increase pressure or add binder |

### Validation Steps

Before measuring:
1. **Visual check**: Uniform appearance, no cracks
2. **Thickness check**: Measure actual vs. calculated
3. **Test scan**: Quick edge scan to verify μt

## Frequently Asked Questions

### Q: Why does the calculator give different thicknesses for different edges?

**A**: Each edge has different absorption characteristics. For multiple edges, we use:
- Transmission: Maximum thickness (satisfies all edges)
- Fluorescence: Minimum thickness (prevents over-absorption)

### Q: How accurate is the packing factor estimate?

**A**: The slider provides rough estimates. For publication-quality work:
1. Prepare a test pellet
2. Measure mass and volume
3. Calculate actual packing: (mass/volume)/theoretical_density
4. Use this value in future preparations

### Q: Can I use any material as a dilutant?

**A**: Ideal dilutants have:
- Low absorption at your edge energy
- No chemical reaction with sample
- Similar particle size after grinding
- Available in pure form

### Q: What if my calculated mass is < 1 mg?

**A**: Options:
1. Increase sample dimensions
2. Reduce packing factor (looser powder)
3. Prepare larger batch and use portion
4. Consider if dilution is necessary

### Q: How do I handle air-sensitive samples?

**A**: 
1. Use capillary geometry with sealed ends
2. Work in glove box/bag
3. Consider Kapton-wrapped pellets
4. Use appropriate capillary material (not glass for fluorides)

### Q: What's the 50 eV offset in calculations?

**A**: The calculator uses absorption at 50 eV above the edge energy because:
- Avoids edge anomalies
- Provides stable absorption value
- Standard practice in XAS community

### Q: Should I trust the density database?

**A**: The database provides:
- Known densities for common compounds
- Estimates for others
- Always better to use measured density if available

## Getting Help

1. **Hover over any parameter** for tooltips
2. **Check the Theory document** for detailed physics
3. **View calculation reports** for step-by-step math
4. **GitHub Issues** for bugs or feature requests

## Safety Considerations

When preparing samples:
- Use appropriate PPE (gloves, mask for fine powders)
- Work in fume hood if toxic materials
- Check MSDS for all materials
- Properly label all samples
- Dispose of waste appropriately

## Next Steps

1. Start with known samples to verify calculations
2. Document your preparation protocol
3. Measure actual packing factors for your materials
4. Share your experience to improve the calculator

Remember: Consistent preparation technique is more important than perfect calculations. The calculator provides a good starting point, but empirical optimization may be needed for your specific materials and measurement conditions.