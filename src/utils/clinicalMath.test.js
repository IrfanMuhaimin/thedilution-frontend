// src/utils/clinicalMath.test.js
import { describe, it, expect } from 'vitest';
// --- IMPORT DIRECTLY FROM YOUR REAL PROJECT CODE ---
import { calculateBolusDose, calculateInfusionConcentration, calculateFlowRate } from './clinicalMath';

describe('Clinical Decision Support: Pharmacokinetic Calculations', () => {

    describe('Bolus Protocol (Direct Injection)', () => {
        it('should calculate the exact target dose for a 20kg patient at 5mg/kg (100.0 mg)', () => {
            const calculated = calculateBolusDose(20, 5.0);
            expect(calculated).toBe(100.0);
        });

        it('should calculate the exact target dose for a 21kg patient at 5mg/kg (105.0 mg)', () => {
            const calculated = calculateBolusDose(21, 5.0);
            expect(calculated).toBe(105.0);
        });
    });

    describe('Infusion Protocol (Continuous Dilution)', () => {
        const apiVolume = 5.0;
        const apiConcentration = 50.0; 
        const diluentVolume = 20.0;
        const patientWeight = 60.0;

        it('should calculate the correct diluted mixture concentration (10.0 mg/mL)', () => {
            const calculated = calculateInfusionConcentration(apiVolume, apiConcentration, diluentVolume);
            expect(calculated).toBe(10.0);
        });

        it('should calculate the correct minimum volumetric flow rate (6.0 mL/hour)', () => {
            const minDoseRate = 1.0; 
            const concentration = 10.0; 
            const expectedMinFlowRate = 6.0;

            const calculated = calculateFlowRate(patientWeight, minDoseRate, concentration);
            expect(calculated).toBe(expectedMinFlowRate);
        });

        it('should calculate the correct maximum volumetric flow rate (24.0 mL/hour)', () => {
            const maxDoseRate = 4.0; 
            const concentration = 10.0; 
            const expectedMaxFlowRate = 24.0;

            const calculated = calculateFlowRate(patientWeight, maxDoseRate, concentration);
            expect(calculated).toBe(expectedMaxFlowRate);
        });
    });
});