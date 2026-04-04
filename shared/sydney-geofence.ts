/**
 * Sydney Metro Area Geo-Fence
 *
 * Defines the service boundary for 4 Paws — Cat Sitting Marketplace.
 * All sitters and owners must be located within the Greater Sydney
 * metropolitan area to use the platform.
 *
 * Boundary: roughly a 50 km radius from Sydney CBD (-33.8688, 151.2093),
 * clipped to the coastline on the east. The bounding box covers from
 * Campbelltown / Sutherland in the south to Palm Beach / Hornsby in the
 * north, and the Blue Mountains fringe in the west.
 */

// ── Bounding box (lat/lng) ──────────────────────────────────────────
export const SYDNEY_BOUNDS = {
  north: -33.4500, // Palm Beach / Ku-ring-gai
  south: -34.1200, // Campbelltown / Royal National Park
  west: 150.5200, // Blue Mountains fringe / Penrith
  east: 151.3500, // Eastern beaches / coastline
} as const;

// Centre of Sydney CBD
export const SYDNEY_CENTRE = {
  latitude: -33.8688,
  longitude: 151.2093,
} as const;

// Maximum radius in kilometres from CBD
export const MAX_RADIUS_KM = 55;

// ── Recognised Sydney suburbs (comprehensive list) ──────────────────
// Covers all major suburbs within the Greater Sydney metro area.
// Names are stored in lower-case for case-insensitive matching.
export const SYDNEY_SUBURBS: string[] = [
  // CBD & Inner City
  "sydney", "sydney cbd", "the rocks", "barangaroo", "darling harbour", "haymarket",
  "chinatown", "ultimo", "pyrmont", "millers point", "dawes point",

  // Eastern Suburbs
  "bondi", "bondi beach", "bondi junction", "bronte", "clovelly", "coogee",
  "double bay", "dover heights", "edgecliff", "elizabeth bay", "kensington",
  "kingsford", "maroubra", "paddington", "point piper", "queens park",
  "randwick", "rose bay", "rushcutters bay", "tamarama", "vaucluse",
  "waverley", "watsons bay", "woollahra", "centennial park", "moore park",
  "bellevue hill", "darling point", "potts point",

  // Inner West
  "newtown", "enmore", "marrickville", "stanmore", "petersham", "lewisham",
  "dulwich hill", "summer hill", "ashfield", "haberfield", "leichhardt",
  "lilyfield", "rozelle", "balmain", "birchgrove", "annandale", "glebe",
  "camperdown", "erskineville", "st peters", "tempe", "sydenham",
  "ashbury", "canterbury", "hurlstone park", "earlwood", "croydon",
  "croydon park", "burwood", "strathfield", "homebush", "concord",
  "five dock", "drummoyne", "russell lea", "abbotsford", "cabarita",
  "canada bay", "rhodes", "wentworth point", "olympic park", "sydney olympic park",
  "wareemba", "rodd point", "breakfast point",

  // North Shore (Lower)
  "north sydney", "milsons point", "kirribilli", "lavender bay",
  "mcmahons point", "waverton", "wollstonecraft", "crows nest",
  "st leonards", "artarmon", "naremburn", "cammeray", "cremorne",
  "cremorne point", "neutral bay", "mosman", "balmoral",

  // North Shore (Upper)
  "chatswood", "willoughby", "castlecrag", "northbridge", "roseville",
  "lindfield", "killara", "gordon", "pymble", "turramurra", "wahroonga",
  "warrawee", "st ives", "st ives chase", "west pymble", "east killara",
  "east lindfield", "east roseville", "lane cove", "lane cove north",
  "lane cove west", "greenwich", "longueville", "riverview",
  "hunters hill", "woolwich", "henley",

  // Northern Beaches
  "manly", "manly vale", "fairlight", "balgowlah", "balgowlah heights",
  "clontarf", "seaforth", "allambie heights", "brookvale", "dee why",
  "curl curl", "freshwater", "queenscliff", "north manly", "narrabeen",
  "north narrabeen", "collaroy", "collaroy plateau", "cromer",
  "beacon hill", "oxford falls", "frenchs forest", "forestville",
  "killarney heights", "belrose", "davidson", "terry hills",
  "duffys forest", "terrey hills", "mona vale", "bayview", "church point",
  "newport", "bilgola", "bilgola plateau", "avalon", "avalon beach",
  "whale beach", "palm beach", "clareville", "warriewood",
  "elanora heights", "ingleside", "north curl curl",

  // Parramatta & Western Sydney
  "parramatta", "north parramatta", "westmead", "harris park",
  "granville", "south granville", "merrylands", "guildford",
  "auburn", "lidcombe", "berala", "regents park", "silverwater",
  "newington", "ermington", "rydalmere", "dundas", "dundas valley",
  "telopea", "carlingford", "epping", "eastwood", "marsfield",
  "north ryde", "macquarie park", "macquarie university",
  "denistone", "denistone east", "denistone west", "west ryde",
  "meadowbank", "ryde", "gladesville", "putney", "tennyson point",
  "oatlands", "northmead", "wentworthville", "pendle hill",
  "toongabbie", "old toongabbie", "seven hills", "baulkham hills",
  "castle hill", "west pennant hills", "pennant hills", "beecroft",
  "cheltenham", "thornleigh", "normanhurst", "hornsby", "hornsby heights",
  "asquith", "mount colah", "mount kuring-gai", "waitara",

  // Hills District
  "the hills", "bella vista", "norwest", "kellyville", "kellyville ridge",
  "rouse hill", "beaumont hills", "the ponds", "stanhope gardens",
  "glenwood", "parklea", "acacia gardens", "quakers hill",
  "kings langley", "winston hills", "constitution hill",
  "northmead", "north rocks", "cherrybrook", "dural", "galston",
  "arcadia", "glenhaven",

  // South Sydney
  "redfern", "waterloo", "zetland", "rosebery", "beaconsfield",
  "alexandria", "mascot", "botany", "eastgardens", "eastlakes",
  "pagewood", "hillsdale", "banksmeadow", "daceyville",

  // St George & Sutherland
  "hurstville", "kogarah", "rockdale", "arncliffe", "wolli creek",
  "tempe", "bardwell park", "bardwell valley", "bexley", "bexley north",
  "kingsgrove", "beverly hills", "narwee", "riverwood", "padstow",
  "revesby", "panania", "east hills", "picnic point", "milperra",
  "bankstown", "bass hill", "chester hill", "sefton", "birrong",
  "yagoona", "condell park", "greenacre", "lakemba", "wiley park",
  "punchbowl", "roselands", "belmore", "campsie", "clemton park",
  "belfield", "strathfield south", "enfield", "burwood heights",
  "allawah", "carlton", "sans souci", "sandringham", "dolls point",
  "ramsgate", "ramsgate beach", "monterey", "brighton-le-sands",
  "kyeemagh", "turrella", "banksia", "penshurst", "mortdale",
  "oatley", "lugarno", "peakhurst", "peakhurst heights",
  "connells point", "blakehurst", "kyle bay", "south hurstville",
  "kogarah bay", "carss park",

  // Sutherland Shire
  "sutherland", "kirrawee", "gymea", "gymea bay", "miranda",
  "caringbah", "caringbah south", "cronulla", "woolooware",
  "kurnell", "taren point", "sylvania", "sylvania waters",
  "oyster bay", "como", "jannali", "bonnet bay", "loftus",
  "engadine", "heathcote", "waterfall", "grays point",
  "kareela", "barden ridge", "menai", "illawong", "alfords point",
  "bangor", "lucas heights", "woronora", "woronora heights",

  // South West
  "liverpool", "fairfield", "cabramatta", "canley vale", "canley heights",
  "villawood", "carramar", "lansdowne", "smithfield", "wetherill park",
  "bossley park", "bonnyrigg", "bonnyrigg heights", "edensor park",
  "abbotsbury", "cecil hills", "green valley", "hinchinbrook",
  "hoxton park", "prestons", "casula", "moorebank", "chipping norton",
  "hammondville", "holsworthy", "wattle grove", "voyager point",
  "pleasure point", "sandy point",

  // Campbelltown & Macarthur
  "campbelltown", "ingleburn", "minto", "leumeah", "macquarie fields",
  "glenfield", "macarthur", "narellan", "camden", "harrington park",
  "mount annan", "currans hill", "spring farm", "elderslie",
  "gregory hills", "oran park",

  // Blacktown & Greater West
  "blacktown", "mount druitt", "rooty hill", "doonside", "woodcroft",
  "plumpton", "oakhurst", "hassall grove", "bidwill", "dharruk",
  "emerton", "lethbridge park", "tregear", "whalan", "shalvey",
  "willmot", "hebersham", "cranebrook", "cambridge park", "werrington",
  "kingswood", "penrith", "emu plains", "leonay", "glenmore park",
  "regentville", "jamisontown", "south penrith", "mulgoa",
  "orchard hills", "luddenham", "badgerys creek", "kemps creek",
  "cecil park", "horsley park", "prospect", "pemulwuy",
  "greystanes", "girraween", "lalor park", "toongabbie",
  "bungarribee", "schofields", "riverstone", "marsden park",
  "box hill", "vineyard", "windsor", "richmond", "north richmond",
  "clarendon", "mcgraths hill", "south windsor", "bligh park",
  "pitt town",

  // Wollondilly (fringe)
  "picton", "thirlmere", "tahmoor", "bargo",

  // Generic / alternate names
  "sydney metro", "greater sydney", "inner west", "eastern suburbs",
  "north shore", "northern beaches", "western sydney", "south west sydney",
  "hills district", "sutherland shire", "st george",
];

// Pre-build a Set for O(1) lookups
const SUBURB_SET = new Set(SYDNEY_SUBURBS.map((s) => s.toLowerCase().trim()));

/**
 * Check whether a suburb name falls within the Sydney metro area.
 * Performs a case-insensitive, trimmed lookup against the known list.
 * Also accepts partial matches (e.g. "Bondi" matches "Bondi Beach").
 */
export function isSuburbInSydney(suburb: string): boolean {
  const normalised = suburb.toLowerCase().trim();
  if (!normalised) return false;
  if (SUBURB_SET.has(normalised)) return true;

  // Partial / fuzzy: check if the input is a substring of any known suburb
  // or if any known suburb is a substring of the input
  for (const known of SYDNEY_SUBURBS) {
    if (known.includes(normalised) || normalised.includes(known)) {
      return true;
    }
  }
  return false;
}

/**
 * Check whether a lat/lng coordinate falls within the Sydney bounding box.
 */
export function isCoordinateInSydney(lat: number, lng: number): boolean {
  return (
    lat >= SYDNEY_BOUNDS.south &&
    lat <= SYDNEY_BOUNDS.north &&
    lng >= SYDNEY_BOUNDS.west &&
    lng <= SYDNEY_BOUNDS.east
  );
}

/**
 * Calculate the Haversine distance (km) between two coordinates.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check whether a coordinate is within MAX_RADIUS_KM of Sydney CBD.
 */
export function isWithinSydneyRadius(lat: number, lng: number): boolean {
  return (
    haversineDistanceKm(
      lat,
      lng,
      SYDNEY_CENTRE.latitude,
      SYDNEY_CENTRE.longitude
    ) <= MAX_RADIUS_KM
  );
}

/**
 * Master validation: returns true if the location (suburb and/or coordinates)
 * is within the Sydney service area.
 *
 * - If coordinates are provided, uses bounding-box + radius check.
 * - Falls back to suburb name lookup.
 */
export function isLocationInServiceArea(
  suburb?: string,
  latitude?: number,
  longitude?: number
): boolean {
  // Coordinate check takes priority (more accurate)
  if (latitude !== undefined && longitude !== undefined) {
    return isCoordinateInSydney(latitude, longitude) && isWithinSydneyRadius(latitude, longitude);
  }
  // Fallback to suburb name
  if (suburb) {
    return isSuburbInSydney(suburb);
  }
  return false;
}

/**
 * Human-readable error message for out-of-area users.
 */
export const OUT_OF_AREA_MESSAGE =
  "4 Paws is currently available in the Greater Sydney metro area only. " +
  "Please enter a suburb within Sydney to continue.";
