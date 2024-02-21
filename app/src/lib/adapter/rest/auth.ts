import type { AdapterProfile } from "../types";


/**
 * This function will authenticate and set the token to the authObject
 * 
 * If there is no token, it will set the authObject to null
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @returns Profile information
 */
export const GetProfile = async (token: string | null): Promise<AdapterProfile | null> => {
  if (!token) {
    return null;
  }

  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      userid: body.userid,
      username: body.username,
      email: body.email,
      description: body.description,
      title: body.title,
      ranking: body.ranking,
      displayedgames: body.displayedgames,
      role: body.role
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will fetch a new token from the server
 * 
 * If the request fails Error is thrown containing the API error message
 * @param username Username
 * @param password Password
 * @returns JWT tokens
 */
export const Login = async (username: string, password: string): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/login`, {
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

/**
 * This function will fetch a new token from the server by using OIDC provider
 * 
 * If the request fails Error is thrown containing the API error message
 * @returns JWT tokens
 */
export const LoginOIDC = async (): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/oidc/login`, {
    method: 'GET'
  });

  const body = await resp.json();

  if (resp.ok) {
    return body.token;
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will register a new user
 * 
 * If the request fails Error is thrown containing the API error message
 * @param username Username
 * @param email Email Address
 * @param password Password
 */
export const Register = async (username: string, email: string, password: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/register`, {
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

  if (resp.ok) {
    return;
  } else {
    const body = await resp.json();
    throw new Error(body.error);
  }
}

/**
 * This function will change the information of a user
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth token (Bearer)
 * @param newusername New Username
 * @param newdescription New Description
 */
export const ChangeUser = async (token: string | null, newusername: string, newdescription: string, newdisplayedgames: number): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/editprofile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      newusername: newusername,
      newdescription: newdescription,
      newdisplayedgames: newdisplayedgames
    })
  })

  if (resp.ok) {
    return;
  } else {
    const body = await resp.json();
    throw new Error(body.error);
  }
}

/**
 * This function will change the password of a user
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth token (Bearer)
 * @param oldpassword Old Password
 * @param newpassword New Password
 */
export const ChangePassword = async (token: string | null, oldpassword: string, newpassword: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/auth/editpassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      oldpassword: oldpassword,
      newpassword: newpassword
    })
  })

  if (resp.ok) {
    return;
  } else {
    const body = await resp.json();
    throw new Error(body.error);
  }
}