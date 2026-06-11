export const validatePassword = (password) => {
    if (!password) return { isValid: false, hasLength: false, hasUpper: false, hasLower: false, hasNumber: false };
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
        hasLength,
        hasUpper,
        hasLower,
        hasNumber,
        isValid: hasLength && hasUpper && hasLower && hasNumber
    };
};