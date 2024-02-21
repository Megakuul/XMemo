import type { AdapterConfig, AdapterUser } from "../types";

/**
 * This function will fetch the xmemo config (requires maintainance|admin role)
 * 
 * If the request fails Error is thrown containing the API error message
 * @returns Config information
 */
export const GetConfig = async (): Promise<AdapterConfig | null> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/admin/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      rankedcardpairs: body.rankedcardpairs,
      rankedmovetime: body.rankedmovetime,
      titlemap: Object.entries(body.titlemap),
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will update the xmemo config (requires maintainance|admin role)
 * 
 * If the request fails Error is thrown containing the API error message
 * @param newconfig Updated configuration
 */
export const UpdateConfig = async (newconfig: AdapterConfig): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/admin/editconfig`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      newrankedcardpairs: newconfig.rankedcardpairs,
      newrankedmovetime: newconfig.rankedmovetime,
      newtitlemap: JSON.stringify(newconfig.titlemap)
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return body.message;
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will fetch user information
 * 
 * If the request fails Error is thrown containing the API error message
 * @param username Username to search for
 * @returns User information
 */
export const GetUser = async (username: string): Promise<AdapterUser | null> => {
  const resp = await fetch(
    `${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/admin/user?username=${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const body = await resp.json();

  if (resp.ok) {
    return {
      userid: body.user.userid,
      username: body.user.username,
      email: body.user.email,
      ranking: body.user.ranking,
      role: body.user.role
    };
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will update user information
 * 
 * Takes a full user configuration, but does not apply all properties!
 * (properties like username and email are immutable for administrator due to privacy reasons)
 * 
 * If the request fails Error is thrown containing the API error message
 * @param user User element
 */
export const UpdateUser = async (user: AdapterUser): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL?import.meta.env.VITE_API_URL:""}/api/admin/edituser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: user.userid,
      newrole: user.role,
    })
  });

  const body = await resp.json();

  if (resp.ok) {
    return body.message;
  } else {
    throw new Error(body.error);
  }
}