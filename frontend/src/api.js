import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const convertJavaToCSharp = async (javaCode) => {
  try {
    const response = await axios.post(`${API_URL}/convert/java-to-csharp`, {
      code: javaCode,
    });
    return response.data.convertedCode;
  } catch (error) {
    console.error('Error converting code:', error);
    return 'Error converting code';
  }
};
