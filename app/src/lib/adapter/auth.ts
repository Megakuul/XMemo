export interface IProfile {
  username: string;
  email: string;
  description: string;
  title: string;
  ranking: string;
}

/**
 * This function will authenticate and set the token to the authObject
 * 
 * If there is no token, it will set the authObject to null
 * If the token is invalid, it will throw an error
 */
export const GetProfile = async (token: string | null): Promise<IProfile | null> => {
  if (!token) {
    return null;
  }

  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      username: body.username,
      email: body.email,
      description: body.description,
      title: body.title,
      ranking: body.ranking,
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will fetch a new token from the server
 * 
 * If the credentials are invalid it will throw an error
 * @param username Username
 * @param password Password
 */
export const Login = async (username: string, password: string): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return body.token;
  } else {
    throw new Error(body.error);
  }
}

export const Register = async (username: string, email: string, password: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password,
      email: email
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return;
  } else {
    throw new Error(body.error);
  }
}