import type { AdapterConfig, AdapterUser } from "../types";

/**
 * This function will fetch the xmemo config (requires maintainance|admin role)
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @returns Config information
 */
export const GetConfig = async (token: string | null): Promise<AdapterConfig | null> => {
  if (!token) {
    return null;
  }

  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/admin/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      rankedcardpairs: body.rankedcardpairs,
      rankedmovetime: body.rankedmovetime,
      titlemap: body.titlemap,
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will update the xmemo config (requires maintainance|admin role)
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @param newconfig Updated configuration
 */
export const UpdateConfig = async (token: string | null, newconfig: AdapterConfig): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/admin/editconfig`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      newrankedcardpairs: newconfig.rankedcardpairs,
      newrankedmovetime: newconfig.rankedmovetime,
      newtitlemap: newconfig.titlemap
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
 * This function will fetch user information
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @param username Username to search for
 * @returns User information
 */
export const GetUser = async (token: string | null, username: string): Promise<AdapterUser | null> => {
  if (!token) {
    return null;
  }

  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/admin/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      username: username,
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      userid: body.userid,
      username: body.username,
      email: body.email,
      ranking: body.ranking,
      role: body.role
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will update user information
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @param userid ID of user to update
 * @param newrole New role to assign to the user
 */
export const UpdateUser = async (token: string | null, userid: string, newrole: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/admin/edituser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      userid: userid,
      newrole: newrole,
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return;
  } else {
    throw new Error(body.error);
  }
}