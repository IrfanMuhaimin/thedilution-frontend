// src/utils/clinicalMath.js

export const calculateBolusDose = (weight, ratio) => {
    return parseFloat((weight * ratio).toFixed(1));
};

export const calculateInfusionConcentration = (apiVolume, apiConcentration, diluentVolume) => {
    const totalMass = apiVolume * apiConcentration;
    const totalVolume = apiVolume + diluentVolume;
    return totalVolume > 0 ? parseFloat((totalMass / totalVolume).toFixed(1)) : 0;
};

export const calculateFlowRate = (weight, doseRate, concentration) => {
    if (concentration <= 0) return 0;
    return parseFloat(((weight * doseRate) / concentration).toFixed(1));
};