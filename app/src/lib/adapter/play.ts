export const JoinQueue = async (token: string | null): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/play/queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
  })

  const body = await resp.json();

  if (resp.ok) {
    return body.message;
  } else {
    throw new Error(body.error);
  }
}

export const ListQueue = async (): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/play/queue`, {
    method: 'GET'
  })

  const body = await resp.json();

  if (resp.ok) {
    return body.queue;
  } else {
    throw new Error(body.error);
  }
}

export const Move = async (token: string | null, game_id: string, discover_id: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ""}/api/play/move?gameid=${game_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    },
    body: JSON.stringify({
      discover_id: discover_id
    })
  })

  if (resp.ok) {
    return;
  } else if (resp.status == 401) {
    throw new Error("Log in to contribute to the Game");
  } else {
    const body = await resp.json();
    throw new Error(body.error);
  }
}