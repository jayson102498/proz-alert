import { Base64 } from 'js-base64'

export const encrypt = (text: string) => {
    return Base64.encode(text)
}

export const decrypt = (text: string) => {
    return Base64.decode(text)
}

export const getValidPhoneNumber = (number: string) => {
    if (number.includes('+81')) {
        return number.replace('-', '')
    }
    if (number.substring(0, 3) === '090' || number.substring(0, 3) === '080' || number.substring(0, 3) === '070') {
        return '+81' + number.substring(1).replace('-', '')
    }
    if (number === '+19712480933') {
        return number
    }
    return false
}

export const removeSpecialChars = (text: string) => {
    return text.replace(/[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF0-9]/g, '')
}
