export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: { userId?: string };
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string };
  Settings: undefined;
  Premium: undefined;
  PetProfile: { petId: string };
  CreatePet: undefined;
  VideoCall: { matchId: string };
  Map: undefined;
};

export type TabParamList = {
  Home: undefined;
  Swipe: undefined;
  Matches: undefined;
  Profile: undefined;
};
