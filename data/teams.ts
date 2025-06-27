export interface Team {
  id: string; // e.g., 'KC', 'LAL'
  name: string; // e.g., 'Chiefs', 'Lakers'
  city: string; // e.g., 'Kansas City', 'Los Angeles'
  abbreviation: string; // Same as id
  sport: 'NFL' | 'NBA';
  primaryColor: string; // Hex format: '#FF0000'
  secondaryColor: string; // Hex format: '#FFFFFF'
}

export const NFL_TEAMS: Team[] = [
  // AFC East
  {
    id: 'BUF',
    name: 'Bills',
    city: 'Buffalo',
    abbreviation: 'BUF',
    sport: 'NFL',
    primaryColor: '#00338D',
    secondaryColor: '#C60C30',
  },
  {
    id: 'MIA',
    name: 'Dolphins',
    city: 'Miami',
    abbreviation: 'MIA',
    sport: 'NFL',
    primaryColor: '#008E97',
    secondaryColor: '#FC4C02',
  },
  {
    id: 'NE',
    name: 'Patriots',
    city: 'New England',
    abbreviation: 'NE',
    sport: 'NFL',
    primaryColor: '#002244',
    secondaryColor: '#C60C30',
  },
  {
    id: 'NYJ',
    name: 'Jets',
    city: 'New York',
    abbreviation: 'NYJ',
    sport: 'NFL',
    primaryColor: '#125740',
    secondaryColor: '#FFFFFF',
  },

  // AFC North
  {
    id: 'BAL',
    name: 'Ravens',
    city: 'Baltimore',
    abbreviation: 'BAL',
    sport: 'NFL',
    primaryColor: '#241773',
    secondaryColor: '#9E7C0C',
  },
  {
    id: 'CIN',
    name: 'Bengals',
    city: 'Cincinnati',
    abbreviation: 'CIN',
    sport: 'NFL',
    primaryColor: '#FB4F14',
    secondaryColor: '#000000',
  },
  {
    id: 'CLE',
    name: 'Browns',
    city: 'Cleveland',
    abbreviation: 'CLE',
    sport: 'NFL',
    primaryColor: '#311D00',
    secondaryColor: '#FF3C00',
  },
  {
    id: 'PIT',
    name: 'Steelers',
    city: 'Pittsburgh',
    abbreviation: 'PIT',
    sport: 'NFL',
    primaryColor: '#FFB612',
    secondaryColor: '#101820',
  },

  // AFC South
  {
    id: 'HOU',
    name: 'Texans',
    city: 'Houston',
    abbreviation: 'HOU',
    sport: 'NFL',
    primaryColor: '#03202F',
    secondaryColor: '#A71930',
  },
  {
    id: 'IND',
    name: 'Colts',
    city: 'Indianapolis',
    abbreviation: 'IND',
    sport: 'NFL',
    primaryColor: '#002C5F',
    secondaryColor: '#A2AAAD',
  },
  {
    id: 'JAX',
    name: 'Jaguars',
    city: 'Jacksonville',
    abbreviation: 'JAX',
    sport: 'NFL',
    primaryColor: '#101820',
    secondaryColor: '#D7A22A',
  },
  {
    id: 'TEN',
    name: 'Titans',
    city: 'Tennessee',
    abbreviation: 'TEN',
    sport: 'NFL',
    primaryColor: '#0C2340',
    secondaryColor: '#4B92DB',
  },

  // AFC West
  {
    id: 'DEN',
    name: 'Broncos',
    city: 'Denver',
    abbreviation: 'DEN',
    sport: 'NFL',
    primaryColor: '#FB4F14',
    secondaryColor: '#002244',
  },
  {
    id: 'KC',
    name: 'Chiefs',
    city: 'Kansas City',
    abbreviation: 'KC',
    sport: 'NFL',
    primaryColor: '#E31837',
    secondaryColor: '#FFB81C',
  },
  {
    id: 'LV',
    name: 'Raiders',
    city: 'Las Vegas',
    abbreviation: 'LV',
    sport: 'NFL',
    primaryColor: '#000000',
    secondaryColor: '#A5ACAF',
  },
  {
    id: 'LAC',
    name: 'Chargers',
    city: 'Los Angeles',
    abbreviation: 'LAC',
    sport: 'NFL',
    primaryColor: '#0080C6',
    secondaryColor: '#FFC20E',
  },

  // NFC East
  {
    id: 'DAL',
    name: 'Cowboys',
    city: 'Dallas',
    abbreviation: 'DAL',
    sport: 'NFL',
    primaryColor: '#041E42',
    secondaryColor: '#869397',
  },
  {
    id: 'NYG',
    name: 'Giants',
    city: 'New York',
    abbreviation: 'NYG',
    sport: 'NFL',
    primaryColor: '#0B2265',
    secondaryColor: '#A71930',
  },
  {
    id: 'PHI',
    name: 'Eagles',
    city: 'Philadelphia',
    abbreviation: 'PHI',
    sport: 'NFL',
    primaryColor: '#004C54',
    secondaryColor: '#A5ACAF',
  },
  {
    id: 'WAS',
    name: 'Commanders',
    city: 'Washington',
    abbreviation: 'WAS',
    sport: 'NFL',
    primaryColor: '#5A1414',
    secondaryColor: '#FFB612',
  },

  // NFC North
  {
    id: 'CHI',
    name: 'Bears',
    city: 'Chicago',
    abbreviation: 'CHI',
    sport: 'NFL',
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
  },
  {
    id: 'DET',
    name: 'Lions',
    city: 'Detroit',
    abbreviation: 'DET',
    sport: 'NFL',
    primaryColor: '#0076B6',
    secondaryColor: '#B0B7BC',
  },
  {
    id: 'GB',
    name: 'Packers',
    city: 'Green Bay',
    abbreviation: 'GB',
    sport: 'NFL',
    primaryColor: '#203731',
    secondaryColor: '#FFB612',
  },
  {
    id: 'MIN',
    name: 'Vikings',
    city: 'Minnesota',
    abbreviation: 'MIN',
    sport: 'NFL',
    primaryColor: '#4F2683',
    secondaryColor: '#FFC62F',
  },

  // NFC South
  {
    id: 'ATL',
    name: 'Falcons',
    city: 'Atlanta',
    abbreviation: 'ATL',
    sport: 'NFL',
    primaryColor: '#A71930',
    secondaryColor: '#000000',
  },
  {
    id: 'CAR',
    name: 'Panthers',
    city: 'Carolina',
    abbreviation: 'CAR',
    sport: 'NFL',
    primaryColor: '#0085CA',
    secondaryColor: '#101820',
  },
  {
    id: 'NO',
    name: 'Saints',
    city: 'New Orleans',
    abbreviation: 'NO',
    sport: 'NFL',
    primaryColor: '#D3BC8D',
    secondaryColor: '#101820',
  },
  {
    id: 'TB',
    name: 'Buccaneers',
    city: 'Tampa Bay',
    abbreviation: 'TB',
    sport: 'NFL',
    primaryColor: '#D50A0A',
    secondaryColor: '#34302B',
  },

  // NFC West
  {
    id: 'ARI',
    name: 'Cardinals',
    city: 'Arizona',
    abbreviation: 'ARI',
    sport: 'NFL',
    primaryColor: '#97233F',
    secondaryColor: '#000000',
  },
  {
    id: 'LAR',
    name: 'Rams',
    city: 'Los Angeles',
    abbreviation: 'LAR',
    sport: 'NFL',
    primaryColor: '#003594',
    secondaryColor: '#FFA300',
  },
  {
    id: 'SF',
    name: '49ers',
    city: 'San Francisco',
    abbreviation: 'SF',
    sport: 'NFL',
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D',
  },
  {
    id: 'SEA',
    name: 'Seahawks',
    city: 'Seattle',
    abbreviation: 'SEA',
    sport: 'NFL',
    primaryColor: '#002244',
    secondaryColor: '#69BE28',
  },
];

export const NBA_TEAMS: Team[] = [
  // Atlantic Division
  {
    id: 'BOS',
    name: 'Celtics',
    city: 'Boston',
    abbreviation: 'BOS',
    sport: 'NBA',
    primaryColor: '#007A33',
    secondaryColor: '#BA9653',
  },
  {
    id: 'BKN',
    name: 'Nets',
    city: 'Brooklyn',
    abbreviation: 'BKN',
    sport: 'NBA',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
  },
  {
    id: 'NYK',
    name: 'Knicks',
    city: 'New York',
    abbreviation: 'NYK',
    sport: 'NBA',
    primaryColor: '#006BB6',
    secondaryColor: '#F58426',
  },
  {
    id: 'PHI',
    name: '76ers',
    city: 'Philadelphia',
    abbreviation: 'PHI',
    sport: 'NBA',
    primaryColor: '#006BB6',
    secondaryColor: '#ED174C',
  },
  {
    id: 'TOR',
    name: 'Raptors',
    city: 'Toronto',
    abbreviation: 'TOR',
    sport: 'NBA',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
  },

  // Central Division
  {
    id: 'CHI',
    name: 'Bulls',
    city: 'Chicago',
    abbreviation: 'CHI',
    sport: 'NBA',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
  },
  {
    id: 'CLE',
    name: 'Cavaliers',
    city: 'Cleveland',
    abbreviation: 'CLE',
    sport: 'NBA',
    primaryColor: '#6F263D',
    secondaryColor: '#FFB81C',
  },
  {
    id: 'DET',
    name: 'Pistons',
    city: 'Detroit',
    abbreviation: 'DET',
    sport: 'NBA',
    primaryColor: '#C8102E',
    secondaryColor: '#1D42BA',
  },
  {
    id: 'IND',
    name: 'Pacers',
    city: 'Indiana',
    abbreviation: 'IND',
    sport: 'NBA',
    primaryColor: '#002D62',
    secondaryColor: '#FDBB30',
  },
  {
    id: 'MIL',
    name: 'Bucks',
    city: 'Milwaukee',
    abbreviation: 'MIL',
    sport: 'NBA',
    primaryColor: '#00471B',
    secondaryColor: '#EEE1C6',
  },

  // Southeast Division
  {
    id: 'ATL',
    name: 'Hawks',
    city: 'Atlanta',
    abbreviation: 'ATL',
    sport: 'NBA',
    primaryColor: '#E03A3E',
    secondaryColor: '#C1D32F',
  },
  {
    id: 'CHA',
    name: 'Hornets',
    city: 'Charlotte',
    abbreviation: 'CHA',
    sport: 'NBA',
    primaryColor: '#1D1160',
    secondaryColor: '#00788C',
  },
  {
    id: 'MIA',
    name: 'Heat',
    city: 'Miami',
    abbreviation: 'MIA',
    sport: 'NBA',
    primaryColor: '#98002E',
    secondaryColor: '#F9A01B',
  },
  {
    id: 'ORL',
    name: 'Magic',
    city: 'Orlando',
    abbreviation: 'ORL',
    sport: 'NBA',
    primaryColor: '#0077C0',
    secondaryColor: '#C4CED4',
  },
  {
    id: 'WAS',
    name: 'Wizards',
    city: 'Washington',
    abbreviation: 'WAS',
    sport: 'NBA',
    primaryColor: '#002B5C',
    secondaryColor: '#E31837',
  },

  // Northwest Division
  {
    id: 'DEN',
    name: 'Nuggets',
    city: 'Denver',
    abbreviation: 'DEN',
    sport: 'NBA',
    primaryColor: '#0E2240',
    secondaryColor: '#FEC524',
  },
  {
    id: 'MIN',
    name: 'Timberwolves',
    city: 'Minnesota',
    abbreviation: 'MIN',
    sport: 'NBA',
    primaryColor: '#0C2340',
    secondaryColor: '#236192',
  },
  {
    id: 'OKC',
    name: 'Thunder',
    city: 'Oklahoma City',
    abbreviation: 'OKC',
    sport: 'NBA',
    primaryColor: '#007AC1',
    secondaryColor: '#EF3B24',
  },
  {
    id: 'POR',
    name: 'Trail Blazers',
    city: 'Portland',
    abbreviation: 'POR',
    sport: 'NBA',
    primaryColor: '#E03A3E',
    secondaryColor: '#000000',
  },
  {
    id: 'UTA',
    name: 'Jazz',
    city: 'Utah',
    abbreviation: 'UTA',
    sport: 'NBA',
    primaryColor: '#002B5C',
    secondaryColor: '#F9A01B',
  },

  // Pacific Division
  {
    id: 'GSW',
    name: 'Warriors',
    city: 'Golden State',
    abbreviation: 'GSW',
    sport: 'NBA',
    primaryColor: '#1D428A',
    secondaryColor: '#FFC72C',
  },
  {
    id: 'LAC',
    name: 'Clippers',
    city: 'Los Angeles',
    abbreviation: 'LAC',
    sport: 'NBA',
    primaryColor: '#C8102E',
    secondaryColor: '#1D428A',
  },
  {
    id: 'LAL',
    name: 'Lakers',
    city: 'Los Angeles',
    abbreviation: 'LAL',
    sport: 'NBA',
    primaryColor: '#552583',
    secondaryColor: '#FDB927',
  },
  {
    id: 'PHX',
    name: 'Suns',
    city: 'Phoenix',
    abbreviation: 'PHX',
    sport: 'NBA',
    primaryColor: '#1D1160',
    secondaryColor: '#E56020',
  },
  {
    id: 'SAC',
    name: 'Kings',
    city: 'Sacramento',
    abbreviation: 'SAC',
    sport: 'NBA',
    primaryColor: '#5A2D81',
    secondaryColor: '#63727A',
  },

  // Southwest Division
  {
    id: 'DAL',
    name: 'Mavericks',
    city: 'Dallas',
    abbreviation: 'DAL',
    sport: 'NBA',
    primaryColor: '#00538C',
    secondaryColor: '#002B5E',
  },
  {
    id: 'HOU',
    name: 'Rockets',
    city: 'Houston',
    abbreviation: 'HOU',
    sport: 'NBA',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
  },
  {
    id: 'MEM',
    name: 'Grizzlies',
    city: 'Memphis',
    abbreviation: 'MEM',
    sport: 'NBA',
    primaryColor: '#5D76A9',
    secondaryColor: '#12173F',
  },
  {
    id: 'NOP',
    name: 'Pelicans',
    city: 'New Orleans',
    abbreviation: 'NOP',
    sport: 'NBA',
    primaryColor: '#0C2340',
    secondaryColor: '#C8102E',
  },
  {
    id: 'SAS',
    name: 'Spurs',
    city: 'San Antonio',
    abbreviation: 'SAS',
    sport: 'NBA',
    primaryColor: '#C4CED4',
    secondaryColor: '#000000',
  },
];

// Combined array of all teams
export const ALL_TEAMS = [...NFL_TEAMS, ...NBA_TEAMS];

// Helper functions
export const getTeamById = (id: string): Team | undefined => {
  return ALL_TEAMS.find((team) => team.id === id);
};

export const getTeamsBySport = (sport: 'NFL' | 'NBA'): Team[] => {
  return ALL_TEAMS.filter((team) => team.sport === sport);
};

export const getTeamByFullName = (fullName: string): Team | undefined => {
  // Try to match by combining city and name
  return ALL_TEAMS.find((team) => {
    const teamFullName = `${team.city} ${team.name}`;
    return teamFullName === fullName;
  });
};
