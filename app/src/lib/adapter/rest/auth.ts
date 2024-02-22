import type { AdapterProfile } from "../types";


/**
 * This function will fetch profile information
 * 
 * If the request fails it returns null
 * @returns Profile information
 */
export const GetProfile = async (): Promise<AdapterProfile | null> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });

  // Unauthorized is in this scenario expected and is skipped
  if (resp.status==401) {
    return null;
  }

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
    return null;
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
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: "include",
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
 * This function will fetch a new token from the server
 * 
 * If the request fails Error is thrown containing the API error message
 * @param username Username
 * @param password Password
 * On success, the token is added to the cookie
 */
export const Login = async (username: string, password: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: "include",
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return;
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will fetch a new token from the server by using OIDC provider
 * 
 * On success, the token is added to the cookie and the user is redirected to /profile
 */
export const LoginOIDC = (): void => {
  window.location.href = `${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/oidc/login`;
}

/**
 * This function will remove the httpOnly cookie and log the user out
 * 
 * If the request fails Error is thrown containing the API error message
 * @returns Socket token
 */
export const GetSocketToken = async (): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/getsockettoken`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });

  const body = await resp.json();

  if (resp.ok) {
    return body.token;
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will change the information of a user
 * 
 * If the request fails Error is thrown containing the API error message
 * @param newusername New Username
 * @param newdescription New Description
 */
export const ChangeUser = async (newusername: string, newdescription: string, newdisplayedgames: number): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/editprofile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
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
 * @param oldpassword Old Password
 * @param newpassword New Password
 */
export const ChangePassword = async (oldpassword: string, newpassword: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/editpassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
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

/**
 * This function will remove the httpOnly cookie and log the user out
 * 
 * If the request fails Error is thrown containing the API error message
 */
export const Logout = async (): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/auth/logout`, {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const body = await resp.json();

  if (resp.ok) {
    return;
  } else {
    throw new Error(body.error);
  }
}