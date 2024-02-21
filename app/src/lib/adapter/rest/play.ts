/**
 * This function will join / remove the user from the queue.
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @returns API success message
 */
export const JoinQueue = async (token: string | null): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/play/queue`, {
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

/**
 * This function will return the all queue entries.
 * 
 * If the request fails Error is thrown containing the API error message
 * @returns API success message
 */
export const ListQueue = async (): Promise<any> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/play/queue`, {
    method: 'GET'
  })

  const body = await resp.json();

  if (resp.ok) {
    return body.queue;
  } else {
    throw new Error(body.error);
  }
}

/**
 * This function will perform a Move
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @param game_id ID of the game
 * @param discover_id card to discover
 * @returns API success message
 */
export const Move = async (token: string | null, game_id: string, discover_id: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/play/move?gameid=${game_id}`, {
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

/**
 * This function will take a Move of the enemy (if time ran out)
 * 
 * If the request fails Error is thrown containing the API error message
 * @param token Auth bearer
 * @param game_id ID of the game
 * @returns API success message
 */
export const TakeMove = async (token: string | null, game_id: string): Promise<void> => {
  const resp = await fetch(`${import.meta.env.VITE_DEV_API_URL?import.meta.env.VITE_DEV_API_URL:""}/api/play/takemove?gameid=${game_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
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