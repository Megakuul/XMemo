// This file contains adapter interfaces that match the API / Socket input
// It allows type safety for types from the backend

export interface AdapterConfig {
  rankedcardpairs: number;
  rankedmovetime: number;
  titlemap: Array<[string, string]>;
}

export interface AdapterUser {
  userid: string;
  username: string;
  email: string;
  ranking: string;
  role: string;
}

export interface AdapterProfile {
  userid: string;
  username: string;
  email: string;
  description: string;
  title: string;
  ranking: string;
  displayedgames: number;
  role: string;
}

export interface AdapterCard {
  rotate: boolean;
  _id: string;
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
}

export interface AdapterPlayer {
  id: string;
  username: string;
  title: string;
  ranking: number;
  rankupdate: number;
}

export interface AdapterGame {
  _id: any;
  player1: AdapterPlayer;
  player2: AdapterPlayer;
  winner_username: string;
  draw: boolean;
  active_id: string;
  nextmove: string;
  moveTimems: number;
  game_stage: number;
  moves: number;
  created: Date;

  cards: AdapterCard[];
}

export interface AdapterGameQueue {
  user_id: string;
  username: string;
  ranking: number;
  title: string;
}