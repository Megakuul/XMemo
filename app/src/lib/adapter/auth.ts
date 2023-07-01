export interface IProfile {
  userid: string;
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

  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/auth/profile`, {
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
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/auth/login`, {
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
 * This function will register a new user
 * @param username Username
 * @param email Email Address
 * @param password Password
 */
export const Register = async (username: string, email: string, password: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/auth/register`, {
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
 * @param token Auth token (Bearer)
 * @param newusername New Username
 * @param newdescription New Description
 */
export const ChangeUser = async (token: string | null, newusername: string, newdescription: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/auth/editprofile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      newusername: newusername,
      newdescription: newdescription
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
 * @param token Auth token (Bearer)
 * @param oldpassword Old Password
 * @param newpassword New Password
 */
export const ChangePassword = async (token: string | null, oldpassword: string, newpassword: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/auth/editpassword`, {
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