export interface IConfig {
  rankedcardpairs: number;
  rankedmovetime: number;
  titlemap: string;
}

export interface IUser {
  userid: string;
  username: string;
  email: string;
  ranking: string;
  role: string;
}

export const GetConfig = async (token: string | null): Promise<IConfig | null> => {
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

export const UpdateConfig = async (token: string | null, newconfig: IConfig): Promise<void> => {
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

export const GetUser = async (token: string | null, username: string): Promise<IUser | null> => {
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