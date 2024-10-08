// ==UserScript==
// @name         WME Road Shield Assistant
// @namespace    https://greasyfork.org/en/users/286957-skidooguy
// @version      2024.10.05.00
// @description  Adds shield information display to WME 
// @author       SkiDooGuy
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @grant        none
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global $ */
/* global OL */
/* global OpenLayers */
/* global _ */
/* global require */
/* global I18n */

const GF_LINK = 'https://greasyfork.org/en/scripts/425050-wme-road-shield-assisstant';
const FORUM_LINK = 'https://www.waze.com/forum/viewtopic.php?f=1851&t=315748';
const RSA_UPDATE_NOTES = `<b>NEW:</b><br>
- Updated shields for Canada<br><br>
<b>FIXES:</b><br>
- No longer highlights alt street names when it shouldn't<br><br>`;

    var [zm0, zm1, zm2, zm3, zm4, zm5, zm6, zm7, zm8, zm9, zm10] = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

const RoadAbbr = {
    //Canada    
	40: {
        "Alberta": {
            'Hwy 1$': 5000, 						            // 5000: National-Trans-Canada Highway
            'Hwy 1A': 5011,  						            // 5011: Alberta - Provincial Hwy
            'Hwy 2': 5011,							            // 5011: Alberta - Provincial Hwy
            'Hwy 3$' : 5015,						            // 5015: Alberta - Crowsnext Hwy
            'Hwy 3A' : 5011,						            // 5011: Alberta - Provincial Hwy
            'Hwy 16$' : 5000,						            // 5000: National-Trans-Canada Highway
            'Hwy 16A' : 5011,						            // 5011: Alberta - Provincial Hwy
            'Hwy ([4-9]|1[0-5])\b' : 5011, 					    // 5011: Alberta - Provincial Hwy
            'Hwy (1[7-9]|[2-9]\d|1\d{2}|20\d|21[0-6])\b' : 5011,// 5011: Alberta - Provincial Hwy
            'Hwy (21[7-9]|2[2-9]\d|[3-9]\d{2})\b' : 5011		// 5011: Alberta - Provincial Hwy
		},
		"British Columbia": {
            'Hwy 1': 5000, 							            // 5000: National-Trans-Canada Highway
            'Hwy 2': 5001,  						            // 5001: BC - Provincial Hwy
            'Hwy 3': 5002,  						            // 5002: BC - Crowsnest Hwy
            'Hwy 16': 5000,							            // 5000: National-Trans-Canada Highway
            'Hwy 113': 5004,						            // 5004: BC - Nisga'a Hwy
            'Hwy ([4-9]|[1-9]\d|10\d|11[0-2])\b' : 5001,		// 5001: BC - Provincial Hwy
            'Hwy (11[4-9]|1[2-9]\d|[2-9]\d{2})\b' : 5001		// 5001: BC - Provincial Hwy
		},
		"Saskatchewan": {
            'Hwy 1': 5000, 							            // 5000: National - Trans-Canada Hwy
            'Hwy 16' : 5000,						            // 5000: National - Trans-Canada Hwy
            'Hwy ([2-9]|1[0-5])\b' : 5030,					    // 5030: Saskatchewan - Provincial Hwy
            'Hwy (1[7-9]|[2-9]\d|[1-3]\d{2})\b' : 5030,			// 5030: Saskatchewan - Provincial Hwy
            'Hwy (90\d|9[1-9]\d)\b' : 5031,					    // 5031: Saskatchewan - Northern Secondary Hwy
            'Hwy (60\d|6[1-9]\d|7\d{2})\b' : 5032			    // 5032: Saskatchewan - Municipal Road
		},
		"Manitoba": {
            'Hwy 1': 5000, 							            // 5000: National - Trans-Canada Hwy
            'Hwy 16': 5000,							            // 5000: National - Trans-Canada Hwy
            'Hwy ([2-9]|1[0-5])\b': 5038,					    // 5038: Manitoba - Provincial Trunk Highway
            'Hwy (1[7-9]|[2-9]\d|1\d{2})\b': 5038,				// 5038: Manitoba - Provincial Trunk Highway
            'Hwy (20\d|2[1-9]\d|[3-9]\d{2})\b': 5039			// 5039: Manitoba - Provincial Rd
        },
		"Ontario": {
            'QEW': 5058, 							            // 5058: Ontario QEW
            'Hwy 17' : 5000,						            // 5000: National - Trans-Canada Hwy
            'Hwy 407 ETR' : 5060,						        // 5060: Ontario ETR
            'Hwy 412' : 5059,						            // 5059: Ontario Toll Hwy
            'Hwy 418' : 5059,						            // 5059: Ontario Toll Hwy
            'Hwy ([1-9]|1[0-6])\b' : 5057,					    // 5057: Ontario King's Hwy 1-16
            'Hwy (1[89]|[2-9]\d|[1-3]\d{2}|40[0-6])\b' : 5057,	// 5057: Ontario King's Hwy 18-406
            'Hwy (40[89]|41[01])\b' : 5057,					    // 5057: Ontario King's Hwy 408-411
            'Hwy (41[3-7])\b' : 5057,					        // 5057: Ontario King's Hwy 413-417
            'Hwy (419|4[2-9]\d)\b' : 5057,					    // 5057: Ontario King's Hwy 419-499
            'Hwy (50\d|5[1-9]\d|6\d{2})\b' : 5061,				// 5061: Ontario Secondary Hwy 500-699
            'Hwy (80\d|8[1-9]\d)\b' : 5057					    // 5057: Ontario Tertiary Hwy
		},
		"Quebec": {
            'Rte Transcanadienne' : 5093,					    // 5093: Quebec: Route Transcanadienne
            'Aut ([1-9]|[1-9]\d{1,2})\b' : 5090,				// 5090: Quebec Autoroute 1-999
            'Rte (10\d|1[1-9]\d|[23]\d{2})\b' : 5091,			// 5091: Quebec Route 100-399
            'R (10\d|1[1-9]\d|[2-9]\d{2}|1[0-4]\d{2}|15[0-5]\d)\b' : 5092	// 5092: Quebec Route 100-1559
		},
		"New Brunswick": {
            'Rte 2': 5000, 							            // 5000: Trans-Canada Hwy
            'Rte 16': 5000,							            // 5000: Trans-Canada Hwy
            'Rte 1': 5112,							            // 5112: NB Arterial Highway 1
            'Rte ([3-9]|1[0-5])\b' : 5112,					    // 5112: NB Arterial Highway 3-15
            'Rte (1[7-9]|[2-9]\d)\b' : 5112,				    // 5112: NB Arterial Highway 17-99
            'Rte (10\d|1[1-9]\d)\b' : 511,					    // 5113: NB Collector Highway 100-199
            'Rte (20\d|2[1-9]\d|[3-9]\d{2})\b' : 5114			// 5114: NB Local Highway 200-999
		},
		"Nova Scotia": {
            'Hwy ([1-9]|[1-9]\d)\b': 5116, 					    // 5116: NS Trunk Hwy 1-99
            'Hwy (10[0-4])\b': 5115,					        // 5115: NS Arterial Hwy 100-104
            'Hwy (10[5-6])\b': 5000,					        // 5000: National Trans Canada Highway 105-106
            'Hwy (10[7-9]|1[1-9]\d)\b' : 5115,				    // 5115: NS Aterial Hwy 107-199
            'Hwy (20\d|2[1-9]\d|3\d{2})\b' : 5117				// 5117: NS Collector Hwy 200-399
		},
		"Newfoundland & Labrador": {
            'Hwy 1': 5000, 							            // 5000: National - Trans-Canada Hwy 1
            'Hwy ([2-9]|[1-9]\d|[1-5]\d{2})\b' : 5129			// NLR: Newfoundland Labrador Route 2-599
		},
		"Prince Edward Island": {
            'Rte 1$': 5000,							            // 5000: National Trans-Canada Hwy
            'Rte ([2-9]|[1-9]\d{1,2})\b' : 5144				    // 5144: PEI - Provincial Highway
		},
		"Yukon": {
            'Hwy 1': 5145, 							            // 5145: Yukon - Territorial Hwy - Orange
            'Hwy 2': 5146, 							            // 5146: Yukon - Territorial Hwy - Amber
            'Hwy 3': 5147, 							            // 5147: Yukon - Territorial Hwy - Maroon
            'Hwy 4': 5148, 							            // 5148: Yukon - Territorial Hwy - Brown
            'Hwy 5': 5149, 							            // 5149: Yukon - Territorial Hwy - Blue
            'Hwy 6': 5150, 							            // 5150: Yukon - Territorial Hwy - Teal
            'Hwy 7': 5147, 							            // 5147: Yukon - Territorial Hwy - Maroon
            'Hwy 8': 5148, 							            // 5148: Yukon - Territorial Hwy - Brown
            'Hwy 9': 5151, 							            // 5151: Yukon - Territorial Hwy - Black
            'Hwy 10': 5151, 						            // 5151: Yukon - Territorial Hwy - Black
            'Hwy 11': 5149, 						            // 5149: Yukon - Territorial Hwy - Blue
            'Hwy 37': 5147 							            // 5147: Yukon - Territorial Hwy - Maroon
		},
		"Northwest Territories": {
            'Hwy ([1-9]|10)\b': 5152					        // 5152: NWT - Territorial Hwy 1-10
		}
	},
    // France
    73: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072,
            'A[0-9]+[^:]*': 1072,
            'M[0-9]+[^:]*': 1067,
            'C[0-9]+[^:]*': 3333,
            'T[0-9]+[^:]*': 3037
        }
    },
    // Germany
    81: {
        '': {
            '(A[0-9]{1,3})': 1012,
            '(B[0-9]{1,3})': 1094
        }
    },
    // Mexico
    // 145: {

    // },

    // Ukraine
    232: {
        '': {
           '(E[0-9]{2,3})': 1048,
           '(М-[0-9]{2})': 1071,
           '(Н-[0-9]{2})': 1071,
           '(Р-[0-9]{2})': 1008,
           '(Т-[0-9]{2}-[0-9]{2,3})': 1008,
           '(О[0-9]{6,7})': 1085,
           '(С[0-9]{6,7})': 1085
       } 
    },
    // US
    235: {
        "Alabama": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SR-": 2019
        },
        "Alaska": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SR-": 2017
        },
        "Arizona": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SR-": 2022
        },
        "Arkansas": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "AR-": 2020,
            "AR-$1 SPUR": 2020
        },
        "California": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 1082,
            "SR-": 1082
        },   
        "Colorado": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 2025,
            "SR-": 2025
        },
        "Connecticut": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 2027,
            "SR-": 2027
        },
        "Delaware": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 7,
            "SR-": 7
        },
        "District of Columbia": {
            'I-': 5,
            'US-': 6,
            "DC-": 7
        },
        "Florida": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 2030,
            "SR-": 2030
        },
        "Georgia": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 2036,
            "SR-": 2036
        },
        "Hawaii": {
            'I-': 5,
            'US-': 6,
            "CR-": 2002,
            "SH-": 2041,
            "SR-": 2041
        },
        "Idaho": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2043,
            "SR-": 2043
        },
        "Illinois": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2044,
            "SR-": 2044
        },
        "Indiana": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2045,
            "SR-": 2045,
            "IN-": 2045
        },
        "Iowa": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 7,
            "SR-": 7,
            "IA-": 7
        },
        "Kansas": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2046,
            "SR-": 2046,
            "K-": 2046
        },
        "Kentucky": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 7,
            "SR-": 7,
        },
        "Louisiana": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 1117,
            "SR-": 1117,
            "LA-": 1117,
            "LA SPUR": 1115
        },
        "Maine": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2051,
            "SR-": 2051
        },
        "Maryland": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2053,
            "SR-": 2053,
            "MD-": 2053
        },
        "Massachusetts": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2055,
            "SR-": 2055
        },
        "Michigan": {
            'I-': 5,
            'US-': 6,
            'CR-': 2056,
            'M-': 2056,
            'SR-': 2056
        },
        "Minnesota": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2060,
            "SR-": 2060,
            "MN-": 2060
        },
        "Mississippi": {
            'I-': 5,
            'US-': 6,
            "SH-": 7,
            "SR-": 7,
            "MS-": 7
        },
        "Missouri": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2061,
            "SR-": 2061,
            "MO-": 2061
        },
        "Montana": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2063,
            "SR-": 2063
        },
        "Nebraska": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 7,
            "SR-": 7,
            "L-": 7,
            "N-": 7,
            "S-": 7
        },
        "Nevada": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2086,
            "SR-": 2086
        },
        "New Hampshire": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2076,
            "SR-": 2076
        },
        "New Jersey": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 7,
            "SR-": 7
        },
        "New Mexico": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2085,
            "SR-": 2085
        },
        "New York": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2087,
            "SR-": 2087,
            "NY-": 2087,
            "NY SPUR": 2087
        },
        "North Carolina": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2065,
            "SR-": 2065,
            "NC-": 2065
        },
        "North Dakota": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2070,
            "SR-": 2070,
            "ND-": 2070
        },
        "Ohio": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2095,
            "SR-": 2095
        },
        "Oklahoma": {
            'I-': 5,
            'US-': 6,
            "SH-": 2097,
            "SR-": 2097
        },
        "Oregon": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2099,
            "SR-": 2099
        },
        "Pennsylvania": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2101,
            "SR-": 2101
        },
        "Rhode Island": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2108,
            "SR-": 2108
        },
        "South Carolina": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2109,
            "SR-": 2109,
            "SC-": 2109
        },
        "South Dakota": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2114,
            "SR-": 2114,
            "SD-": 2114
        },
        "Tennessee": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2115,
            "SR-": 2115
        },
        "Texas": {
            'I-': 5,
            'US-': 6,
            "SH-": 2117,
            "SR-": 2117
        },
        "Utah": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2127,
            "SR-": 2127
        },
        "Vermont": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2131,
            "SR-": 2131
        },
        "Virginia": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2128,
            "SR-": 2128
        },
        "Washington": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2133,
            "SR-": 2133
        },
        "West Virginia": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2138,
            "SR-": 2138,
            "WV-": 2138,
        },
        "Wisconsin": {
            'I-': 5,
            'US-': 6,
            "CH-": 2137,
            "CR-": 2137,
            "SH-": 2135,
            "SR-": 2135,
            "WIS-": 2135,
            "WIS SPUR": 2135
        },
        "Wyoming": {
            'I-': 5,
            'US-': 6,
            "CH-": 2002,
            "CR-": 2002,
            "SH-": 2143,
            "SR-": 2143,
            "WY-": 2143,
        }
    },
    // Uruguay
    236: {
       '': {
           'Ruta': 1111
       } 
    },

    // Réunion
    262: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    },
    // Guadeloupe
    590: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    },
    // French Guyana
    594: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    },
    // Martinique
    596: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    },
    // Wallis and Futuna
    681: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    },
    // French Polynesia
    689: {
        '': {
            'D[0-9]+[^:]*': 1092,
            'N[0-9]+[^:]*': 1072
        }
    }
};
const Strings = {
    'en': {
        'enableScript': 'Script enabled',
        'HighSegShields': 'Segments with Shields',
        'HighSegShieldsClr': 'Segments with Shields',
        'ShowSegShields': 'Show Segment Shields on Map',
        'SegShieldMissing': 'Segments that might be missing shields',
        'SegShieldMissingClr': 'Segments that might be missing shields',
        'SegShieldError': "Segments that have shields but maybe shouldn't",
        'SegShieldErrorClr': "Segments that have shields but maybe shouldn't",
        'HighNodeShields': 'Nodes with Shields (TG)',
        'HighNodeShieldsClr': 'Nodes with Shields (TG)',
        'ShowNodeShields': 'Show Node Shield Info',
        'ShowExitShields': 'Has Exit Signs',
        'ShowTurnTTS': 'Has TIO',
        'AlertTurnTTS': 'Alert if TTS is different from default',
        'NodeShieldMissing': 'Nodes that might be missing shields',
        'NodeShieldMissingClr': 'Nodes that might be missing shields',
        'resetSettings': 'Reset Settings',
        'disabledFeat': '(Feature not configured for this country)',
        'ShowTowards': 'Has Towards',
        'ShowVisualInst': 'Has Visual Instruction',
        'SegHasDir': 'Segment Shields with direction',
        'SegHasDirClr': 'Segment Shields with direction',
        'SegInvDir': 'Segment Shields without direction',
        'SegInvDirClr': 'Segment Shields without direction',
        'IconHead': 'Map Icons',
        'HighlightHead': 'Highlights',
        'HighlightColors': 'Highlight Colors',
        'ShowRamps': 'Include Ramps',
        'Experimental': 'Experimental Features (Use at Your own Risk)',
        'AlternativeShields': 'Alternative Name Shields',
        'AlternativePrimaryCity': 'Alternative Street with Primary City',
        'AlternativeNoCity': 'Alternative Street with No City',
        'mHPlus': 'Only show on minor highways or greater',
        'titleCase': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseClr': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseSftClr': 'Direction in free text might not be in large-and-small-caps format',
        'checkTWD': 'Include Towards field',
        'checkTTS': 'Include TTS field',
        'checkVI': 'Include Visual Instruction field'
    },
    'en-us': {
        'enableScript': 'Script enabled',
        'HighSegShields': 'Segments with Shields',
        'HighSegShieldsClr': 'Segments with Shields',
        'ShowSegShields': 'Show Segment Shields on Map',
        'SegShieldMissing': 'Segments that might be missing shields',
        'SegShieldMissingClr': 'Segments that might be missing shields',
        'SegShieldError': "Segments that have shields but maybe shouldn't",
        'SegShieldErrorClr': "Segments that have shields but maybe shouldn't",
        'HighNodeShields': 'Nodes with Shields (TG)',
        'HighNodeShieldsClr': 'Nodes with Shields (TG)',
        'ShowNodeShields': 'Show Node Shield Info',
        'ShowExitShields': 'Has Exit Signs',
        'ShowTurnTTS': 'Has TIO',
        'AlertTurnTTS': 'Alert if TTS is different from default',
        'NodeShieldMissing': 'Nodes that might be missing shields',
        'NodeShieldMissingClr': 'Nodes that might be missing shields',
        'resetSettings': 'Reset Settings',
        'disabledFeat': '(Feature not configured for this country)',
        'ShowTowards': 'Has Towards',
        'ShowVisualInst': 'Has Visual Instruction',
        'SegHasDir': 'Segment Shields with direction',
        'SegHasDirClr': 'Segment Shields with direction',
        'SegInvDir': 'Segment Shields without direction',
        'SegInvDirClr': 'Segment Shields without direction',
        'IconHead': 'Map Icons',
        'HighlightHead': 'Highlights',
        'HighlightColors': 'Highlight Colors',
        'ShowRamps': 'Include Ramps',
        'Experimental': 'Experimental Features (Unstable use at Your own Risk)',
        'AlternativeShields': 'Alternative Name Shields',
        'AlternativePrimaryCity': 'Alternative Street with Primary City',
        'AlternativeNoCity': 'Alternative Street with No City',
        'mHPlus': 'Only show on minor highways or greater',
        'titleCase': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseClr': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseSftClr': 'Direction in free text might not be in large-and-small-caps format',
        'checkTWD': 'Include Towards field',
        'checkTTS': 'Include TTS field',
        'checkVI': 'Include Visual Instruction field'
    },
    'es-419' : {
        'enableScript': 'Script habilitado',
        'HighSegShields': 'Segmentos con escudos',
        'HighSegShieldsClr': 'Segmentos con escudos',
        'ShowSegShields': 'Mostrar escudos de segmentos en el mapa',
        'SegShieldMissing': 'Segmentos a los que les pueden faltar escudos',
        'SegShieldMissingClr': 'Segmentos a los que les pueden faltar escudos',
        'SegShieldError': "Segmentos que tienen escudos y quizá no deberían",
        'SegShieldErrorClr': "Segmentos que tienen escudos y quizá no deberían",
        'HighNodeShields': 'Nodos con escudos (TG)',
        'HighNodeShieldsClr': 'Nodos con escudos (TG)',
        'ShowNodeShields': 'Mostrar Info de Escudo en Nodo',
        'ShowExitShields': 'Incluir iconos de giro (si existen)',
        'ShowTurnTTS': 'Incuir TTS',
        'AlertTurnTTS': 'Alertar si TTS fue modificado',
        'NodeShieldMissing': 'Nodos a los que les pueden faltar escudos',
        'NodeShieldMissingClr': 'Nodos a los que les pueden faltar escudos',
        'resetSettings': 'Reiniciar ajustes',
        'disabledFeat': '(Funcionalidad no configurada para ese país)',
        'ShowTowards': 'Incluir dirección (si existe)',
        'ShowVisualInst': 'Incluir instrucción visual',
        'SegHasDir': 'Escudos con dirección',
        'SegHasDirClr': 'Escudos con dirección',
        'SegInvDir': 'Escudos sin dirección',
        'SegInvDirClr': 'Escudos sin dirección',
        'IconHead': 'Iconos en mapa',
        'HighlightHead': 'Destacar',
        'HighlightColors': 'Reseña de Colores',
        'ShowRamps': 'Incluir Rampas',
        'mHPlus': 'Only show on minor highways or greater',
        'titleCase': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseClr': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseSftClr': 'Direction in free text might not be in large-and-small-caps format',
        'checkTWD': 'Include Towards field',
        'checkTTS': 'Include TTS field',
        'checkVI': 'Include Visual Instruction field'
    },
    'uk': {
        "enableScript":"Скріпт ввімкнено",
        "HighSegShields":"Сегменти з шильдами",
        "HighSegShieldsClr":"Сегменти з шильдами",
        "ShowSegShields":"Показувати шильди на мапі",
        "SegShieldMissing":"Сегменти, яким можливо потрібні шильди",
        "SegShieldMissingClr":"Сегменти, яким можливо потрібні шильди",
        "SegShieldError":"Сегменти, які мають шильди, але можливо вони непотрібні",
        "SegShieldErrorClr":"Сегменти, які мають шильди, але можливо вони непотрібні",
        "HighNodeShields":"Вузли з шильдами (TG)",
        "HighNodeShieldsClr":"Вузли з шильдами (TG)",
        "ShowNodeShields":"Показувати деталі шильда на вузлі ",
        "ShowExitShields":"Включити іконку повороту (якщо вони є)",
        "ShowTurnTTS":"Ввімкнути TTS",
        "AlertTurnTTS":"Сповіщати, якщо TTS відрізняється від типового",
        "NodeShieldMissing":"Вузли, на яких можуть бути відсутні щити",
        "NodeShieldMissingClr":"Вузли, на яких можуть бути відсутні щити",
        "resetSettings":"Скинути налаштування",
        "disabledFeat":"Відсутні налаштування для цієї страни",
        "ShowTowards":"Включаючи Towards (якщо існує)",
        "ShowVisualInst":"Включаючи візуальні інструкції",
        "SegHasDir":"Шильди з напрямками",
        "SegHasDirClr":"Шильди з напрямками",
        "SegInvDir":"Шильди без напрямків",
        "SegInvDirClr":"Шильди без напрямків",
        "IconHead":"Іконки на мапі",
        "HighlightHead":"Підсвічувати",
        "HighlightColors":"Кольори підсвічування",
        "ShowRamps":"Включаючи рампи",
        'mHPlus': 'Only show on minor highways or greater',
        'titleCase': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseClr': 'Segments/nodes with direction not in large-and-small-caps format',
        'TitleCaseSftClr': 'Direction in free text might not be in large-and-small-caps format',
        'checkTWD': 'Include Towards field',
        'checkTTS': 'Include TTS field',
        'checkVI': 'Include Visual Instruction field'
    },
    'fr': {
        "enableScript":"Script activé",
        "HighSegShields":"Segments avec cartouche",
        "HighSegShieldsClr":"Segments avec cartouche",
        "ShowSegShields":"Afficher les cartouches sur la carte", 
        "SegShieldMissing":"Segments dont le cartouche pourrait manquer", 
        "SegShieldMissingClr":"Segments dont le cartouche pourrait manquer", 
        "SegShieldError":"Segments ayant un cartouche mais ne devraient peut-être pas", 
        "SegShieldErrorClr":"Segments ayant un cartouche mais ne devraient peut-être pas", 
        "HighNodeShields":"Noeuds avec cartouche (TG)", 
        "HighNodeShieldsClr":"Noeuds avec cartouche (TG)", 
        "ShowNodeShields":"Afficher les infos des cartouches de noeuds", 
        "ShowExitShields":"As des panneaux de sortie", 
        "ShowTurnTTS":"Has TIO", 
        "AlertTurnTTS":"Alert if TTS is different from default", 
        "NodeShieldMissing":"Noeud dont le cartouche pourrait manquer", 
        "NodeShieldMissingClr":"Noeud dont le cartouche pourrait manquer", 
        "resetSettings":"Réinitialiser les paramètres", 
        "disabledFeat":"Feature not configured for this country", 
        "ShowTowards":'As "En direction de"', 
        "ShowVisualInst":"As des instructions visuelles", 
        "SegHasDir":"Cartouche de segment avec direction", 
        "SegHasDirClr":"Cartouche de segment avec direction", 
        "SegInvDir":"Cartouche de segment sans direction", 
        "SegInvDirClr":"Cartouche de segment sans direction", 
        "IconHead":"Icônes de carte", 
        "HighlightHead":"Surlignages", 
        "HighlightColors":"Couleurs de surlignage", 
        "ShowRamps":"Inclure les bretelles", 
        "mHPlus":"Only show on minor highways or greater", 
        "titleCase":"Segments/nodes with direction not in large-and-small-caps format", 
        "TitleCaseClr":"Segments/nodes with direction not in large-and-small-caps format", 
        "TitleCaseSftClr":"Direction in free text might not be in large-and-small-caps format", 
        "checkTWD":'Inclure le champ "en direction de"', 
        "checkTTS":"Inclure le champ TTS", 
        "checkVI":"Inclure le champ d'instruction visuel"
    }
};
const CheckAltName = [
    // France
    73
];
let BadNames = [];
let rsaSettings;
let UpdateObj;
let SetTurn;
let rsaMapLayer;
let rsaIconLayer;
let LANG;
let alternativeType

console.log('RSA: initializing...');

function rsaBootstrap(tries = 0) {
    if (W && W.map && W.model && W.loginManager.user && $ && WazeWrap.Ready) {
        initRSA();
    } else if (tries < 500) {
        setTimeout(() => {
            rsaBootstrap(tries + 1);
        }, 200);
    } else {
        console.error('RSA: Failed to load');
    }
}

function initRSA() {
    UpdateObj = require('Waze/Action/UpdateObject');
    SetTurn = require('Waze/Model/Graph/Actions/SetTurn');

    const rsaCss = [
        '.rsa-wrapper {position:relative;width:100%;font-size:12px;font-family:"Rubik", "Boing-light", sans-serif;user-select:none;}',
        '.rsa-section-wrapper {display:block;width:100%;padding:4px;}',
        '.rsa-section-wrapper.border {border-bottom:1px solid grey;margin-bottom:5px;}',
        '.rsa-header {font-weight:bold;}',
        '.rsa-option-container {padding:3px;}',
        '.rsa-option-container.no-display {display:none;}',
        '.rsa-option-container.sub {margin-left:20px;}',
        'input[type="checkbox"].rsa-checkbox {display:inline-block;position:relative;top:3px;vertical-align:top;margin:0;}',
        'input[type="color"].rsa-color-input {display:inline-block;position:relative;width:20px;padding:0px 1px;border:0px;vertical-align:top;cursor:pointer;}',
        'input[type="color"].rsa-color-input:focus {outline-width:0;}',
        'label.rsa-label {display:inline-block;position:relative;max-width:80%;vertical-align:top;font-weight:normal;padding-left:5px;word-wrap:break-word;}',
        '.group-title.toolbar-top-level-item-title.rsa:hover {cursor:pointer;}'
    ].join(' ');

    const $rsaTab = $('<div>');
    $rsaTab.html = ([
        `<div class='rsa-wrapper' id='rsa-tab-wrapper'>
            <div style='margin-bottom:5px;border-bottom:1px solid black;'>
                <span style='font-weight:bold;'>
                    <a href='https://www.waze.com/forum/viewtopic.php?f=1851&t=315748' target='_blank' style='text-decoration:none;'>Road Shield Assistant</a>
                </span> - v${GM_info.script.version}
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-enableScript' />
                <label class='rsa-label' for='rsa-enableScript'><span id='rsa-text-enableScript'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowRamps' />
                <label class='rsa-label' for='rsa-ShowRamps'><span id='rsa-text-ShowRamps'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-mHPlus' />
                <label class='rsa-label' for='rsa-mHPlus'><span id='rsa-text-mHPlus'></span></label>
            </div>

            <span id='rsa-text-IconHead' class='rsa-header'></span>
            <div style='border-top:2px solid black;'>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowSegShields' />
                    <label class='rsa-label' for='rsa-ShowSegShields'><span id='rsa-text-ShowSegShields'></span></label>
                </div>
                <div class='rsa-option-container no-display'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-NodeShieldMissing' />
                    <label class='rsa-label' for='rsa-NodeShieldMissing'><span id='rsa-text-NodeShieldMissing'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowNodeShields' />
                    <label class='rsa-label' for='rsa-ShowNodeShields'><span id='rsa-text-ShowNodeShields'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowExitShields' />
                    <label class='rsa-label' for='rsa-ShowExitShields'><span id='rsa-text-ShowExitShields'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowTurnTTS' />
                    <label class='rsa-label' for='rsa-ShowTurnTTS'><span id='rsa-text-ShowTurnTTS'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowTowards' />
                    <label class='rsa-label' for='rsa-ShowTowards'><span id='rsa-text-ShowTowards'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-ShowVisualInst' />
                    <label class='rsa-label' for='rsa-ShowVisualInst'><span id='rsa-text-ShowVisualInst'></span></label>
                </div>
                <div class='rsa-option-container sub' style='display:none;'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-AlertTurnTTS' />
                    <label class='rsa-label' for='rsa-AlertTurnTTS'><span id='rsa-text-AlertTurnTTS'></span></label>
                </div>
            </div>

            <span id='rsa-text-HighlightHead' class='rsa-header'></span>
            <div style='border-top:2px solid black;'>
                <div class='rsa-option-container' style='display:none;'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-HighNodeShields' />
                    <label class='rsa-label' for='rsa-HighNodeShields'><span id='rsa-text-HighNodeShields'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-HighSegShields' />
                    <label class='rsa-label' for='rsa-HighSegShields'><span id='rsa-text-HighSegShields'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-SegHasDir' />
                    <label class='rsa-label' for='rsa-SegHasDir'><span id='rsa-text-SegHasDir'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-SegInvDir' />
                    <label class='rsa-label' for='rsa-SegInvDir'><span id='rsa-text-SegInvDir'></span></label>
                </div>
                <div class='rsa-option-container' id='rsa-container-titleCase'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-titleCase' />
                    <label class='rsa-label' for='rsa-titleCase'><span id='rsa-text-titleCase'></span></label>
                </div>
                <div class='rsa-option-container sub' id='rsa-container-checkTWD'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-checkTWD' />
                    <label class='rsa-label' for='rsa-checkTWD'><span id='rsa-text-checkTWD'></span></label>
                </div>
                <div class='rsa-option-container sub' id='rsa-container-checkTTS'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-checkTTS' />
                    <label class='rsa-label' for='rsa-checkTTS'><span id='rsa-text-checkTTS'></span></label>
                </div>
                <div class='rsa-option-container sub' id='rsa-container-checkVI'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-checkVI' />
                    <label class='rsa-label' for='rsa-checkVI'><span id='rsa-text-checkVI'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-SegShieldMissing' />
                    <label class='rsa-label' for='rsa-SegShieldMissing'><span id='rsa-text-SegShieldMissing'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-SegShieldError' />
                    <label class='rsa-label' for='rsa-SegShieldError'><span id='rsa-text-SegShieldError'></span></label>
                </div>
            </div>
            <span id='rsa-text-HighlightColors' class='rsa-header'></span>
            <div style='border-top:2px solid black;'>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-HighSegClr' />
                    <label class='rsa-label' for='rsa-HighSegClr'><span id='rsa-text-HighSegShieldsClr'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-SegHasDirClr' />
                    <label class='rsa-label' for='rsa-SegHasDirClr'><span id='rsa-text-SegHasDirClr'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-SegInvDirClr' />
                    <label class='rsa-label' for='rsa-SegInvDirClr'><span id='rsa-text-SegInvDirClr'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-MissSegClr' />
                    <label class='rsa-label' for='rsa-MissSegClr'><span id='rsa-text-SegShieldMissingClr'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-ErrSegClr' />
                    <label class='rsa-label' for='rsa-ErrSegClr'><span id='rsa-text-SegShieldErrorClr'></span></label>
                </div>
                <div class='rsa-option-container'>
                    <input type=color class='rsa-color-input' id='rsa-HighNodeClr' />
                    <label class='rsa-label' for='rsa-HighNodeClr'><span id='rsa-text-HighNodeShieldsClr'></span></label>
                </div>
                <div class='rsa-option-container no-display'>
                    <input type=color class='rsa-color-input' id='rsa-MissNodeClr' />
                    <label class='rsa-label' for='rsa-MissNodeClr'><span id='rsa-text-NodeShieldMissingClr'></span></label>
                </div>
                <div class='rsa-option-container' id='rsa-container-TitleCaseClr'>
                    <input type=color class='rsa-color-input' id='rsa-TitleCaseClr' />
                    <label class='rsa-label' for='rsa-TitleCaseClr'><span id='rsa-text-TitleCaseClr'></span></label>
                </div>
                <div class='rsa-option-container' id='rsa-container-TitleCaseSftClr'>
                    <input type=color class='rsa-color-input' id='rsa-TitleCaseSftClr' />
                    <label class='rsa-label' for='rsa-TitleCaseSftClr'><span id='rsa-text-TitleCaseSftClr'></span></label>
                </div>
            </div>
            <span id='rsa-text-Experimental' class='rsa-header'></span>
            <div style='border-top:2px solid black;'>
                <div class='rsa-option-container'>
                    <input type=checkbox class='rsa-checkbox' id='rsa-AlternativeShields' />
                    <label class='rsa-label' for='rsa-AlternativeShields'><span id='rsa-text-AlternativeShields'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=radio class='rsa-checkbox' value='AlternativePrimaryCity' name='AlternativeShields' id='rsa-AlternativePrimaryCity' checked/>
                    <label class='rsa-label' for='rsa-AlternativePrimaryCity'><span id='rsa-text-AlternativePrimaryCity'></span></label>
                </div>
                <div class='rsa-option-container sub'>
                    <input type=radio class='rsa-checkbox' value='AlternativeNoCity' name='AlternativeShields' id='rsa-AlternativeNoCity' />
                    <label class='rsa-label' for='rsa-AlternativeNoCity'><span id='rsa-text-AlternativeNoCity'></span></label>
                </div>
            </div>

            <div style='border-top:2px solid black;'>
                <div class='rsa-option-container'>
                    <input type=button id='rsa-resetSettings' />
                </div>
            </div>
        </div>`
    ].join(' '));
    
    const $rsaFixWrapper = $('<div id="rsa-autoWrapper" class="toolbar-button ItemInactive" style="display:none;margin-right:5px;">');
    const $rsaFixInner = $('<div class="group-title toolbar-top-level-item-title rsa" style="margin:5px 0 0 15px;font-size:12px;">RSA Fix</div>');

    WazeWrap.Interface.Tab('RSA', $rsaTab.html, setupOptions, 'RSA');
    $(`<style type="text/css">${rsaCss}</style>`).appendTo('head');
    // $($rsaFixInner).appendTo($rsaFixWrapper);
    // $($rsaFixWrapper).appendTo($('#primary-toolbar > div'));
    WazeWrap.Interface.ShowScriptUpdate(GM_info.script.name, GM_info.script.version, RSA_UPDATE_NOTES, GF_LINK, FORUM_LINK);
    console.log('RSA: loaded');
}

async function setupOptions() {
    await loadSettings();

    // Create OL layer for display
    rsaMapLayer = new OpenLayers.Layer.Vector('rsaMapLayer', { uniqueName: 'rsaMapLayer' });
    W.map.addLayer(rsaMapLayer);
    rsaMapLayer.setVisibility(true);

    rsaIconLayer = new OpenLayers.Layer.Vector('rsaIconLayer', { uniqueName: 'rsaIconLayer' });
    W.map.addLayer(rsaIconLayer);
    rsaIconLayer.setVisibility(true);

    function processAlternativeSettings() {
        if(rsaSettings.AlternativeShields) {
            $('#rsa-AlternativePrimaryCity').prop('disabled', false);
            $('#rsa-AlternativeNoCity').prop('disabled', false);
            let primaryCityButton = $('#rsa-AlternativePrimaryCity')[0];
            let noCityButton = $('#rsa-AlternativeNoCity')[0]
            if(primaryCityButton.checked) {
                alternativeType = primaryCityButton.value;
            }
            if(noCityButton.checked) {
                alternativeType = noCityButton.value;
            }
        }
        if(!rsaSettings.AlternativeShields) {
            $('#rsa-AlternativePrimaryCity').prop('disabled', true);
            $('#rsa-AlternativeNoCity').prop('disabled', true);
        }
    }
    // Set user options
    function setEleStatus() {
        setChecked('rsa-enableScript', rsaSettings.enableScript);
        setChecked('rsa-HighSegShields', rsaSettings.HighSegShields);
        setChecked('rsa-ShowSegShields', rsaSettings.ShowSegShields);
        setChecked('rsa-SegShieldMissing', rsaSettings.SegShieldMissing);
        setChecked('rsa-SegShieldError', rsaSettings.SegShieldError);
        setChecked('rsa-HighNodeShields', rsaSettings.HighNodeShields);
        setChecked('rsa-ShowNodeShields', rsaSettings.ShowNodeShields);
        setChecked('rsa-ShowExitShields', rsaSettings.ShowExitShields);
        setChecked('rsa-ShowTurnTTS', rsaSettings.ShowTurnTTS);
        setChecked('rsa-AlertTurnTTS', rsaSettings.AlertTurnTTS);
        setChecked('rsa-ShowTowards', rsaSettings.ShowTowards);
        setChecked('rsa-ShowVisualInst', rsaSettings.ShowVisualInst);
        setChecked('rsa-NodeShieldMissing', rsaSettings.NodeShieldMissing);
        setChecked('rsa-SegHasDir', rsaSettings.SegHasDir);
        setChecked('rsa-SegInvDir', rsaSettings.SegInvDir);
        setChecked('rsa-ShowRamps', rsaSettings.ShowRamps);
        setChecked('rsa-mHPlus', rsaSettings.mHPlus);
        setChecked('rsa-titleCase', rsaSettings.titleCase);
        setChecked('rsa-checkTWD', rsaSettings.checkTWD);
        setChecked('rsa-checkTTS', rsaSettings.checkTTS);
        setChecked('rsa-checkVI', rsaSettings.checkVI);
        setChecked('rsa-AlternativeShields', rsaSettings.AlternativeShields);
        setValue('rsa-HighSegClr', rsaSettings.HighSegClr);
        setValue('rsa-MissSegClr', rsaSettings.MissSegClr);
        setValue('rsa-ErrSegClr', rsaSettings.ErrSegClr);
        setValue('rsa-HighNodeClr', rsaSettings.HighNodeClr);
        setValue('rsa-MissNodeClr', rsaSettings.MissNodeClr);
        setValue('rsa-SegHasDirClr', rsaSettings.SegHasDirClr);
        setValue('rsa-SegInvDirClr', rsaSettings.SegInvDirClr);
        setValue('rsa-TitleCaseClr', rsaSettings.TitleCaseClr);
        setValue('rsa-TitleCaseSftClr', rsaSettings.TitleCaseSftClr);

        $('#rsa-AlternativeShields').on('change', function(e) {
            processAlternativeSettings();
        })

        if (rsaSettings.titleCase === true && W.model.getTopCountry().attributes.id === 235) {
            $('#rsa-container-checkTWD').css('display', 'block');
            $('#rsa-container-checkTTS').css('display', 'block');
            $('#rsa-container-checkVI').css('display', 'block');
        } else {
            $('#rsa-container-checkTWD').css('display', 'none');
            $('#rsa-container-checkTTS').css('display', 'none');
            $('#rsa-container-checkVI').css('display', 'none');
        }

        function setChecked(ele, status) {
            $(`#${ele}`).prop('checked', status);
        }

        function setValue(ele, value) {
            const inputElem = $(`#${ele}`);
            inputElem.attr('value', value);
            // inputElem.css('border', `1px solid ${value}`);
        }
    }

    // Register event listeners
    WazeWrap.Events.register('selectionchanged', null, removeAutoFixButton);
    // WazeWrap.Events.register('selectionchanged', null, tryScan);
    WazeWrap.Events.register('moveend', null, removeAutoFixButton);
    WazeWrap.Events.register('moveend', null, tryScan);
    WazeWrap.Events.register('moveend', null, checkOptions);
    WazeWrap.Events.register('afteraction', null, tryScan);

    new WazeWrap.Interface.Shortcut('addShield', 'Activates the Add Shield Button', 'wmersa', 'Road Shield Assistant', rsaSettings.addShield, addShieldClick, null).add();

    setEleStatus();

    $('input[type=radio][name=AlternativeShields]').on('change', function() {
        processAlternativeSettings();
        saveSettings();
        removeHighlights();
        tryScan();
    })

    $('.rsa-checkbox').on("change",function () {
        let settingName = $(this)[0].id.substring(4);
        rsaSettings[settingName] = this.checked;

        // Check to ensure highlight nodes and show node shields don't overlap each other
        // if (settingName = 'ShowNodeShields') {
        //     if (this.checked) {
        //         $('rsa-HighNodeShields').prop('checked', false);
        //         rsaSettings.HighNodeShields = false;
        //     }
        // } else if (settingName = 'HighNodeShields') {
        //     if (this.checked) {
        //         $('rsa-ShowNodeShields').prop('checked', false);
        //         rsaSettings.ShowNodeShields = false;
        //     }
        // }
        if(settingName === 'AlternativeShields') processAlternativeSettings();
        saveSettings();
        removeHighlights();
        tryScan();
    });
    $('.rsa-color-input').on("change",function () {
        let settingName = $(this)[0].id.substring(4);
        rsaSettings[settingName] = this.value;
        saveSettings();
        setEleStatus();
        removeHighlights();
        tryScan();
    });
    $('#rsa-titleCase').trigger("click", function () {
        if (getId('rsa-titleCase').checked) {
            $('#rsa-container-checkTWD').css('display', 'block');
            $('#rsa-container-checkTTS').css('display', 'block');
            $('#rsa-container-checkVI').css('display', 'block');
        } else {
            $('#rsa-container-checkTWD').css('display', 'none');
            $('#rsa-container-checkTTS').css('display', 'none');
            $('#rsa-container-checkVI').css('display', 'none');
        }
    });
    // $('#rsa-ShowNodeShields').click(function() {
    //     if (!getId('rsa-ShowNodeShields').checked) $('.rsa-option-container.sub').hide();
    //     else $('.rsa-option-container.sub').show();
    // });
    $('#rsa-resetSettings').on("click",function() {
        const defaultSettings = {
            lastSaveAction: 0,
            enableScript: true,
            HighSegShields: false,
            ShowSegShields: true,
            SegShieldMissing: false,
            SegShieldError: false,
            SegHasDir: false,
            SegInvDir: false,
            HighNodeShields: true,
            ShowNodeShields: false,
            ShowExitShields: false,
            ShowTurnTTS: false,
            AlertTurnTTS: false,
            ShowTowards: false,
            ShowVisualInst: false,
            NodeShieldMissing: false,
            HighSegClr: '#0066ff',
            MissSegClr: '#00ff00',
            ErrSegClr: '#cc00ff',
            HighNodeClr: '#ff00bf',
            MissNodeClr: '#ff0000',
            SegHasDirClr: '#ffff00',
            SegInvDirClr: '#66ffff',
            TitleCaseClr: '#ff9933',
            TitleCaseSftClr: '#ffff66',
            ShowRamps: true,
            AlternativeShields: false,
            mHPlus: false,
            titleCase: false,
            checkTWD: false,
            checkTTS: false,
            checkVI: false

        }

        rsaSettings = defaultSettings;
        saveSettings();
        setEleStatus();
    });
    // Add translated UI text
    LANG = I18n.currentLocale().toLowerCase();
    if (!Strings[LANG]) LANG = 'en';
    for (let i=0; i < Object.keys(Strings[LANG]).length; i++) {
        let key = Object.keys(Strings[LANG])[i]
        $(`#rsa-text-${key}`).text(Strings[LANG][key]);
    }
    $('#rsa-resetSettings').attr('value', Strings[LANG]['resetSettings']);

    checkOptions();
}

async function loadSettings() {
    const localSettings = $.parseJSON(localStorage.getItem('RSA_Settings'));
    const serverSettings = await WazeWrap.Remote.RetrieveSettings('RSA_Settings');
    if (!serverSettings) {
        console.error('RSA: Error communicating with WW settings server');
    }

    const defaultSettings = {
        lastSaveAction: 0,
        enableScript: true,
        HighSegShields: false,
        ShowSegShields: true,
        SegShieldMissing: false,
        SegShieldError: false,
        SegHasDir: false,
        SegInvDir: false,
        HighNodeShields: true,
        ShowNodeShields: false,
        ShowExitShields: false,
        ShowTurnTTS: false,
        AlertTurnTTS: false,
        ShowTowards: false,
        ShowVisualInst: false,
        NodeShieldMissing: false,
        HighSegClr: '#0066ff',
        MissSegClr: '#00ff00',
        ErrSegClr: '#cc00ff',
        HighNodeClr: '#ff00bf',
        MissNodeClr: '#ff0000',
        SegHasDirClr: '#ffff00',
        SegInvDirClr: '#66ffff',
        TitleCaseClr: '#ff9933',
        TitleCaseSftClr: '#ffff66',
        ShowRamps: true,
        AlternativeShields: false,
        mHPlus: false,
        titleCase: false,
        checkTWD: false,
        checkTTS: false,
        checkVI: false,
        addShield: ''
    };

    rsaSettings = $.extend({}, defaultSettings, localSettings);
    if (serverSettings && serverSettings.lastSaveAction > rsaSettings.lastSaveAction) {
        $.extend(rsaSettings, serverSettings);
        // console.log('RSA: server settings used');
    } else {
        // console.log('RSA: local settings used');
    }

    // If there is no value set in any of the stored settings then use the default
    Object.keys(defaultSettings).forEach((funcProp) => {
        if (!rsaSettings.hasOwnProperty(funcProp)) {
            rsaSettings[funcProp] = defaultSettings[funcProp];
        }
    });

}

async function saveSettings() {
    const {
        enableScript,
        HighSegShields,
        ShowSegShields,
        SegShieldMissing,
        SegShieldError,
        HighNodeShields,
        ShowNodeShields,
        ShowExitShields,
        SegHasDir,
        SegInvDir,
        ShowTurnTTS,
        AlertTurnTTS,
        ShowTowards,
        ShowVisualInst,
        NodeShieldMissing,
        HighSegClr,
        MissSegClr,
        ErrSegClr,
        HighNodeClr,
        MissNodeClr,
        SegHasDirClr,
        SegInvDirClr,
        TitleCaseClr,
        TitleCaseSftClr,
        ShowRamps,
        AlternativeShields,
        mHPlus,
        titleCase,
        checkTWD,
        checkTTS,
        checkVI,
        addShield
    } = rsaSettings;

    const localSettings = {
        lastSaveAction: Date.now(),
        enableScript,
        HighSegShields,
        ShowSegShields,
        SegShieldMissing,
        SegShieldError,
        HighNodeShields,
        ShowNodeShields,
        ShowExitShields,
        SegHasDir,
        SegInvDir,
        ShowTurnTTS,
        AlertTurnTTS,
        ShowTowards,
        ShowVisualInst,
        NodeShieldMissing,
        HighSegClr,
        MissSegClr,
        ErrSegClr,
        HighNodeClr,
        MissNodeClr,
        SegHasDirClr,
        SegInvDirClr,
        TitleCaseClr,
        TitleCaseSftClr,
        ShowRamps,
        AlternativeShields,
        mHPlus,
        titleCase,
        checkTWD,
        checkTTS,
        checkVI,
        addShield
    };

    // Grab keyboard shortcuts and store them for saving
    for (const name in W.accelerators.Actions) {
        const {shortcut, group} = W.accelerators.Actions[name];
        if (group === 'wmersa') {
            let TempKeys = '';
            if (shortcut) {
                if (shortcut.altKey === true) {
                    TempKeys += 'A';
                }
                if (shortcut.shiftKey === true) {
                    TempKeys += 'S';
                }
                if (shortcut.ctrlKey === true) {
                    TempKeys += 'C';
                }
                if (TempKeys !== '') {
                    TempKeys += '+';
                }
                if (shortcut.keyCode) {
                    TempKeys += shortcut.keyCode;
                }
            } else {
                TempKeys = '-1';
            }
            localSettings[name] = TempKeys;
        }
    }

    // Required for the instant update of changes to the keyboard shortcuts on the UI
    rsaSettings = localSettings;

    if (localStorage) {
        localStorage.setItem('RSA_Settings', JSON.stringify(localSettings));
    }
    const serverSave = await WazeWrap.Remote.SaveSettings('RSA_Settings', localSettings);

    if (serverSave === null) {
        console.warn('RSA: User PIN not set in WazeWrap tab');
    } else {
        if (serverSave === false) {
            console.error('RSA: Unable to save settings to server');
        }
    }
}

function getId(ele) {
    return document.getElementById(ele);
}

function checkOptions() {
    const countries = W.model.countries.getObjectArray();

    if (countries.length < 1) {
        setTimeout(function() { checkOptions(); }, 500);
        return;
    } else {
        let allowFeat = false;

        for (let i=0; i < countries.length; i++) {
            if (RoadAbbr[countries[i].id]) allowFeat = true;
        }

        if (!allowFeat) {
            $(`#rsa-text-SegShieldMissing`).prop('checked', false);
            $(`#rsa-text-SegShieldError`).prop('checked', false);
            $(`#rsa-text-NodeShieldMissing`).prop('checked', false);

            $(`#rsa-text-SegShieldMissing`).text(Strings[LANG]['SegShieldMissing'] + ' ' + Strings[LANG]['disabledFeat']);
            $(`#rsa-text-SegShieldError`).text(Strings[LANG]['SegShieldError'] + ' ' + Strings[LANG]['disabledFeat']);
            $(`#rsa-text-NodeShieldMissing`).text(Strings[LANG]['NodeShieldMissing'] + ' ' + Strings[LANG]['disabledFeat']);

            $(`#rsa-SegShieldMissing`).prop('disabled', true);
            $(`#rsa-SegShieldError`).prop('disabled', true);
            $(`#rsa-NodeShieldMissing`).prop('disabled', true);

            rsaSettings.SegShieldMissing = false;
            rsaSettings.SegShieldError = false;
            rsaSettings.NodeShieldMissing = false;
            saveSettings();
        } else {
            $(`#rsa-text-SegShieldMissing`).prop('checked', rsaSettings.SegShieldMissing);
            $(`#rsa-text-SegShieldError`).prop('checked', rsaSettings.SegShieldError);
            $(`#rsa-text-NodeShieldMissing`).prop('checked', rsaSettings.NodeShieldMissing);

            $(`#rsa-text-SegShieldMissing`).text(Strings[LANG]['SegShieldMissing']);
            $(`#rsa-text-SegShieldError`).text(Strings[LANG]['SegShieldError']);
            $(`#rsa-text-NodeShieldMissing`).text(Strings[LANG]['NodeShieldMissing']);

            $(`#rsa-SegShieldMissing`).prop('disabled', false);
            $(`#rsa-SegShieldError`).prop('disabled', false);
            $(`#rsa-NodeShieldMissing`).prop('disabled', false);
        }
    }

    if (W.model.getTopCountry().attributes.id !== 235) {
        $('#rsa-container-titleCase').css('display', 'none');
        $('#rsa-container-TitleCaseClr').css('display', 'none');
        $('#rsa-container-TitleCaseSftClr').css('display', 'none');
    } else {
        $('#rsa-container-titleCase').css('display', 'block');
        $('#rsa-container-TitleCaseClr').css('display', 'block');
        $('#rsa-container-TitleCaseSftClr').css('display', 'block');
    }
}

function autoFixButton() {
    $('#rsa-autoWrapper').css('display', 'inline-block');
    $('#rsa-autoWrapper > div').off();

    // console.log(BadNames);
    // Create function to fix case types when button clicked
    $('#rsa-autoWrapper > div').click(function() {
        const turnGraph = W.model.getTurnGraph();

        for (let i=0; i < BadNames.length; i++) {
            // Check if street or turn
            if (BadNames[i].type) {
                let strt = BadNames[i];
                let dir = strt.direction;

                if (dir.match(/\b(north)\b/i) != null)  dir = 'Nᴏʀᴛʜ';
                if (dir.match(/\b(south)\b/i) != null)  dir = 'Sᴏᴜᴛʜ';
                if (dir.match(/\b(east)\b/i) != null)  dir = 'Eᴀꜱᴛ';
                if (dir.match(/\b(west)\b/i) != null)  dir = 'Wᴇꜱᴛ';

                W.model.actionManager.add(new UpdateObj(strt, { 'direction': dir }));
            } else {
                function fixName(name) {
                    let temp = name;
                    temp = temp.replace(/\b(north)\b/ig, 'Nᴏʀᴛʜ');
                    temp = temp.replace(/\b(south)\b/ig, 'Sᴏᴜᴛʜ');
                    temp = temp.replace(/\b(east)\b/ig, 'Eᴀꜱᴛ');
                    temp = temp.replace(/\b(west)\b/ig, 'Wᴇꜱᴛ');

                    temp = temp.replace(/\b(TO)\b/ig, 'ᴛᴏ');
                    temp = temp.replace(/\b(VIA)\b/ig, 'ᴠɪᴀ');
                    temp = temp.replace(/\b(JCT)\b/ig, 'ᴊᴄᴛ');
                    return temp;
                }

                let turn = BadNames[i];
                let turnDat = turn.getTurnData();
                let turnGuid = turnDat.getTurnGuidance();
                // let newGuid = turnGuid;
                console.log(turn);
                for (s in turnGuid.roadShields) {
                    turnGuid.roadShields[s].direction = fixName(turnGuid.roadShields[s].direction);
                }
                if (rsaSettings.checkTWD && turnGuid.towards) turnGuid.towards = fixName(turnGuid.towards);
                if (rsaSettings.checkTTS && turnGuid.tts) turnGuid.tts = fixName(turnGuid.tts);
                if (rsaSettings.checkVI && turnGuid.visualInstruction) turnGuid.visualInstruction = fixName(turnGuid.visualInstruction);

                console.log(turnGuid);
                turnDat = turnDat.withTurnGuidance(turnGuid);
                W.model.actionManager.add(new SetTurn(turnGraph, turn.withTurnData(turnDat)));
            }
        }
    });
}

function removeAutoFixButton() {
    $('#rsa-autoWrapper > div').off();
    $('#rsa-autoWrapper').css('display', 'none');
}

function addShieldClick() {
    const selFea = W.selectionManager.getSelectedFeatures();
    if (selFea && selFea.length === 1 && selFea[0].WW.getType() === 'segment') {
        $('.add-new-road-shield').trigger("click");
    } else {
        WazeWrap.Alerts.error(GM_info.script.name, 'You must have only 1 segment selected to use the shield editing menu');
    }

    
}

function tryScan() {
    if (!rsaSettings.enableScript) return;

    // Reset the array of objects that need names fixed
    BadNames = [];

    function scanNode(node) {
        let conSegs = node.attributes.segIDs;

        for (let i=0; i < conSegs.length; i++) {
            let seg1 = W.model.segments.getObjectById(conSegs[i]);
            for (let j=0; j < conSegs.length; j++) {
                let seg2 = W.model.segments.getObjectById(conSegs[j]);
                processNode(node, seg1, seg2);
            }
        }
    }

    function scanSeg(seg, showInfo = false) {
        processSeg(seg);
    }

    removeHighlights();
    // let selFea = W.selectionManager.getSelectedFeatures();
    // Scan all segments on screen
    if (rsaSettings.ShowSegShields || rsaSettings.SegShieldMissing || rsaSettings.SegShieldError || rsaSettings.HighSegShields || rsaSettings.titleCase) {
        _.each(W.model.segments.getObjectArray(), s => {
            scanSeg(s);
        });
    }
    // Scan all nodes on screen
    if (rsaSettings.HighNodeShields || rsaSettings.ShowNodeShields || rsaSettings.titleCase) {
        _.each(W.model.nodes.getObjectArray(), n => {
            scanNode(n);
        });
    }
}

function processSeg(seg) {
    if(seg === null) return;
    let segAtt = seg.attributes;
    let streetID = segAtt.primaryStreetID;
    let street = W.model.streets.getObjectById(streetID).attributes;
    let cityID = W.model.cities.getObjectById(street.cityID).attributes;

    if(rsaSettings.AlternativeShields) {
        if(segAtt.streetIDs.length > 0) {
            for(let i = 0 ; i < segAtt.streetIDs.length; ++i) {
                let altStreet = W.model.streets.getObjectById(segAtt.streetIDs[i]).attributes;
                if(alternativeType === 'AlternativePrimaryCity') {
                    if(street.cityID === altStreet.cityID) {
                        street = altStreet;
                        break;
                    }
                }
                else if(alternativeType === 'AlternativeNoCity') {
                    let altCity = W.model.cities.getObjectById(altStreet.cityID).attributes;
                    if(altCity.name === '') {
                        street = altStreet;
                        break;
                    }
                }
            }
        }
    }
    let hasShield = street.signType !== null;
    let stateName = W.model.states.getObjectById(cityID.stateID).attributes.name;
    let countryID = cityID.countryID;
    let candidate = isSegmentCandidate(segAtt, stateName, countryID);

    // Exlude ramps
    if (!rsaSettings.ShowRamps && segAtt.roadType === 4) return;

    // Only show mH and above
    if (rsaSettings.mHPlus && segAtt.roadType !== 3 && segAtt.roadType !== 4 && segAtt.roadType !== 6 && segAtt.roadType !== 7) return;

    // Display shield on map
    if(hasShield === true) {
        if (rsaSettings.ShowSegShields) displaySegShields(seg, street.signType, street.signText, street.direction);

        // If candidate and has shield
        if (rsaSettings.HighSegShields && candidate.isCandidate) {
            if (isValidShield(segAtt)) {
                createHighlight(seg, rsaSettings.HighSegClr);
            } else {
                createHighlight(seg, rsaSettings.ErrSegClr);
            }
        }

        // If not candidate and has shield
        if (rsaSettings.SegShieldError && !candidate.isCandidate) createHighlight(seg, rsaSettings.ErrSegClr);
        if (rsaSettings.SegHasDir && street.direction) createHighlight(seg, rsaSettings.SegHasDirClr);

        // Highlight seg shields with direction
        if (rsaSettings.SegInvDir && !street.direction) createHighlight(seg, rsaSettings.SegInvDirClr);
    }
    // If candidate and missing shield
    if (rsaSettings.SegShieldMissing && candidate.isCandidate && !hasShield) createHighlight(seg, rsaSettings.MissSegClr);

    // Streets without capitalized letters
    if (rsaSettings.titleCase) {
        const badName = matchTitleCase(street);
        if (badName === true) {
            createHighlight(seg, rsaSettings.TitleCaseClr, true);
            // autoFixButton();
        }
    }
}

function processNode(node, seg1, seg2) {
    let turn = W.model.getTurnGraph().getTurnThroughNode(node,seg1,seg2);
    let turnData = turn.getTurnData();
    let hasGuidance = turnData.hasTurnGuidance();

    if (hasGuidance) {
        if (rsaSettings.ShowNodeShields && W.map.getZoom() > 14) displayNodeIcons(node, turnData);

        if (rsaSettings.titleCase) {
            let badName = matchTitleCaseThroughNode(turn);
            if (badName.isBad === true) {
                let color = badName.softIssue ? rsaSettings.TitleCaseSftClr: rsaSettings.TitleCaseClr;
                createHighlight(node, color, true);
                // autoFixButton();
            }
        }
    }
    
}

// Function written by kpouer to accommodate French conventions of shields being based on alt names
function isSegmentCandidate(segAtt, state, country) {
    let street = W.model.streets.getObjectById(segAtt.primaryStreetID);
    let candidate = isStreetCandidate(street, state, country);
    if (candidate.isCandidate) {
        return candidate;
    }

    if (CheckAltName.includes(country)) {
        for (let i = 0; i < segAtt.streetIDs.length; i++) {
            street = W.model.streets.getObjectById(segAtt.streetIDs[i]);
            candidate = isStreetCandidate(street, state, country);
            if (candidate.isCandidate) {
                return candidate;
            }
        }
    }
    return candidate;
}

function isStreetCandidate(street, state, country) {
    const info = {
        isCandidate: false,
        iconID: null
    }

    if (!RoadAbbr[country]) {
        return info;
    }

    //Check to see if the country has states configured in RSA by looking for a key with nothing in it
    const noStates = '' in RoadAbbr[country];
    const name = street.name;
    const abbrvs = noStates ? RoadAbbr[country][''] : RoadAbbr[country][state];

    for (let i=0; i < Object.keys(abbrvs).length; i++) {
        if (name) {
            if (noStates) {
                const abrKey = Object.keys(abbrvs)[i];
                const abbr = new RegExp(abrKey, 'g');
                const isMatch = name.match(abbr);

                if (isMatch && name === isMatch[0]) {
                    info.isCandidate = true;
                    info.iconID = abbrvs[abrKey];
                }
            } else {
                const abbr = Object.keys(abbrvs)[i];
                const isMatch = name.includes(abbr);

                if (isMatch) {
                    // console.log(abbrvs[abbr]);
                    info.isCandidate = true;
                    info.iconID = abbrvs[abbr];
                }
            } 
        }
    }
    return info;
}

function isValidShield(segAtt) {
    let primaryStreet = W.model.streets.getObjectById(segAtt.primaryStreetID);
    if (primaryStreet.name === primaryStreet.signText) {
        return true;
    }
    for (var i = 0;i<segAtt.streetIDs.length;i++) {
        let street = W.model.streets.getObjectById(segAtt.streetIDs[i]);
        if (street.name === primaryStreet.signText) {
            return true;
        }
    }
    return false;
}

function matchTitleCase(street) {
    const dir = street.direction;
    let isBad = false;
    if (dir !== '' && dir !== null) {
        // console.log(dir);
        if (dir.match(/\b(north|south|east|west)\b/i) != null) isBad = true;
        if (dir.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/)  != null) isBad = true;

        if (isBad === true) {
            if (BadNames.length === 0) {
                BadNames.push(street);
            } else {
                let isDuplicate = false;
                for (let i=0; i < BadNames.length; i++) {
                    // if (BadNames[i].type) console.log(BadNames[i].id === street.id);
                    if (BadNames[i].type && BadNames[i].id === street.id) isDuplicate = true;
                }
                if (!isDuplicate) BadNames.push(street);
            }
        }
    }
    return isBad;
}

function matchTitleCaseThroughNode(turn) {
    const turnData = turn.getTurnData();
    const turnGuid = turnData.getTurnGuidance();
    const shields = turnGuid.getRoadShields();
    const twd = turnGuid.getTowards();
    const tts = turnGuid.getTTS();
    const VI = turnGuid.getVisualInstruction();
    let info = {
        isBad: false,
        softIssue: false
    };

    function checkText(txt, isSoft = false) {
        if (txt !== '' && txt !== null) {
            if (txt.match(/\b(north|south|east|west)\b/i) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
            if (txt.match(/\b(TO|VIA|JCT)\b/i) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
            if (txt.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
        }
    }

    function checkTTStext(txt, isSoft = false) {
        if (txt !== '' && txt !== null) {
            if (txt.match(/(Nᴏʀᴛʜ|Sᴏᴜᴛʜ|Eᴀꜱᴛ|Wᴇꜱᴛ)/) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
            if (txt.match(/(ᴛᴏ|ᴠɪᴀ|ᴊᴄᴛ)/) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
            if (txt.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/) != null) { info.isBad = true; if (isSoft) info.softIssue = true; }
        }
    }

    if (shields) {
        _.each(shields, (s) => {
            checkText(s.direction);
        });
    }
    if (twd && twd !== "" && rsaSettings.checkTWD) checkText(twd, true);
    if (tts && tts !== "" && rsaSettings.checkTTS) checkTTStext(tts, true);
    if (VI && VI !== "" && rsaSettings.checkVI) checkText(VI, true);

    if (info.isBad === true) BadNames.push(turn);

    return info;
}

function displayNodeIcons(node, turnDat) {
    const geo = node.getOLGeometry().clone();
    const trnGuid = turnDat.getTurnGuidance();
    const GUIDANCE = {
        shields: {
            exists: false,
            color: '',
            width: 30,
            height: 30,
            sign: '6',
            txt: 'TG'
        },
        exitsign: {
            exists: false,
            color: '',
            width: 30,
            height: 20,
            sign: '2159',
            txt: 'EX'
        },
        tts: {
            exists: false,
            color: '',
            width: 30,
            height: 30,
            sign: '7',
            txt: 'TIO'
        },
        towards: {
            exists: false,
            color: '',
            width: 30,
            height: 30,
            sign: '7',
            txt: 'TW'
        },
        visualIn: {
            exists: false,
            color: '',
            width: 30,
            height: 30,
            sign: '7',
            txt: 'VI'
        }
    };
    let count = 0;

    GUIDANCE.shields.exists = trnGuid.getRoadShields() !== null;
    if (rsaSettings.ShowExitShields) { GUIDANCE.exitsign.exists = (trnGuid.getExitSigns() !== null && trnGuid.getExitSigns().length > 0); }
    if (rsaSettings.ShowTurnTTS) { GUIDANCE.tts.exists = (trnGuid.getTTS() !== null && trnGuid.getTTS().length > 0); }
    if (rsaSettings.ShowTowards) { GUIDANCE.towards.exists = (trnGuid.getTowards() !== null && trnGuid.getTowards().length > 0); }
    if (rsaSettings.ShowVisualInst) { GUIDANCE.visualIn.exists = (trnGuid.getVisualInstruction() !== null && trnGuid.getVisualInstruction().length > 0); }

    const styleNode = {
        strokeColor: rsaSettings.HighNodeClr,
        strokeOpacity: 0.75,
        strokeWidth: 4,
        fillColor: rsaSettings.HighNodeClr,
        fillOpacity: 0.75,
        pointRadius: 3
    };

    let startPoint = {
        x: geo.getVertices()[0].x,
        y: geo.getVertices()[0].y
    }
    let lblStart = {
        x: startPoint.x + LabelDistance().label,
        y: startPoint.y + LabelDistance().label
    }

    // Array of points for line connecting node to icons
    let points = [];
    // Point coords
    let pointNode = new OpenLayers.Geometry.Point(startPoint.x, startPoint.y);
    points.push(pointNode);
    // Label coords
    var pointLabel = new OpenLayers.Geometry.Point(lblStart.x, lblStart.y);
    points.push(pointLabel);


    // Point on node
    let pointFeature = new OpenLayers.Feature.Vector(pointNode, null, styleNode);
    rsaIconLayer.addFeatures([pointFeature]);
    // Line between node and label
    var newline = new OpenLayers.Geometry.LineString(points);
    var lineFeature = new OpenLayers.Feature.Vector(newline, null, styleNode);
    rsaIconLayer.addFeatures([lineFeature]);


    _.each(GUIDANCE, (q) => {
        if (q.exists) {
            // console.log(q);
            const styleLabel = {
                externalGraphic: `https://renderer-am.waze.com/renderer/v1/signs/${q.sign}?text=${q.txt}`,
                graphicHeight: q.height,
                graphicWidth: q.width,
                fontSize: 12,
                graphicZIndex: 700
            };
            let xpoint;
            let ypoint;

            switch(count) {
                case 0:
                    xpoint = lblStart.x;
                    ypoint = lblStart.y;
                    break;
                case 1:
                    xpoint = lblStart.x + LabelDistance().icon;
                    ypoint = lblStart.y;
                    break;
                case 2:
                    xpoint = lblStart.x;
                    ypoint = lblStart.y - LabelDistance().icon;
                    break;
                case 3: 
                    xpoint = lblStart.x + LabelDistance().icon;
                    ypoint = lblStart.y - LabelDistance().icon;
                    break;
                case 4:
                    xpoint = lblStart.x + (LabelDistance().icon * 2);
                    ypoint = lblStart.y;
                    break;
                default:
                    break;
            }

            // Label coords
            let pointLabel = new OpenLayers.Geometry.Point(xpoint, ypoint);
            // Label
            let labelFeat = new OpenLayers.Feature.Vector(pointLabel, null, styleLabel);
            rsaIconLayer.addFeatures([labelFeat]);

            count++;
        }
    });
}

function displaySegShields(segment, shieldID, shieldText, shieldDir) {
    if (W.map.getZoom() < 14) return;

    const iconURL = `https://renderer-am.waze.com/renderer/v1/signs/${shieldID}?text=${shieldText}`;
    let SegmentPoints = [];
    let oldparam = {};
    let labelDis = LabelDistance();
    let width = 37;
    let height = 37;

    if (shieldText.length > 4 && shieldText.length < 7) {
        width = 50;
        height = 40;
    } else if (shieldText.length > 6 && shieldText.length < 9) {
        width = 80;
        height = 45;
    }
    else if (shieldText.length > 8 && shieldText.length < 13) {
        width = 100;
        height = 50;
    }
    oldparam.x = null;
    oldparam.y = null;
    let AtLeastOne = false;
    $.each(segment.getOLGeometry().getVertices(), function(idx, param) {
        // Build a new segment with same geometry
        SegmentPoints.push(new OpenLayers.Geometry.Point(param.x, param.y));

        // Shield icon style
        const style = {
            externalGraphic: iconURL,
            graphicWidth: width,
            graphicHeight: height,
            graphicYOffset: -20,
            graphicZIndex: 650
        };
        // Direction label styel
        const style2 = {
            label: shieldDir !== null ? shieldDir : '',
            fontColor: 'green',
            labelOutlineColor: 'white',
            labelOutlineWidth: 1,
            fontSize: 12
        };

        if (oldparam.x !== null && oldparam.y !== null) {
            if ( Math.abs(oldparam.x - param.x) > labelDis.space || Math.abs(oldparam.y - param.y) > labelDis.space  || AtLeastOne === false) {
                let centerparam = {};
                centerparam.x = ((oldparam.x + param.x) / 2);
                centerparam.y = ((oldparam.y + param.y) / 2);
                if ( Math.abs(centerparam.x - param.x) > labelDis.space || Math.abs(centerparam.y - param.y) > labelDis.space || AtLeastOne === false) {
                    LabelPoint = new OpenLayers.Geometry.Point(centerparam.x, centerparam.y);
                    const pointFeature = new OpenLayers.Feature.Vector(LabelPoint, null, style);
                    // Create point for direction label below shield icon
                    const labelPoint2 = new OpenLayers.Geometry.Point(centerparam.x, centerparam.y - labelDis.label);
                    const imageFeature2 = new OpenLayers.Feature.Vector(labelPoint2, null, style2);
                    rsaIconLayer.addFeatures([pointFeature, imageFeature2]);
                    AtLeastOne = true;
                }
            }
        }
        oldparam.x = param.x;
        oldparam.y = param.y;
    });
}

function createHighlight(obj, color, overSized = false) {
    const geo = obj.getOLGeometry().clone();
    let isNode = obj.type === 'node';

    if (isNode) {
        const styleNode = {
            strokeColor: color,
            strokeOpacity: overSized === true ? 1 : 0.75,
            strokeWidth: 4,
            fillColor: color,
            fillOpacity: 0.75,
            pointRadius: overSized === true ? 7 : 3
        }

        // Point coords
        let pointNode = new OpenLayers.Geometry.Point(geo.x, geo.y);

        // Point on node
        var pointFeature = new OpenLayers.Feature.Vector(pointNode, null, styleNode);
        rsaIconLayer.addFeatures([pointFeature]);
    } else {
        // console.log('seg highlight')
        const style = {
            strokeColor: color,
            strokeOpacity: overSized === true ? 1 : 0.75,
            strokeWidth: overSized === true ? 7 : 4,
            fillColor: color,
            fillOpacity: 0.75
        }
        const newFeat =  new OpenLayers.Geometry.LineString(geo.components, {});
        const newVector = new OpenLayers.Feature.Vector(newFeat, null, style);
        rsaMapLayer.addFeatures([newVector]);
    }
}

function removeHighlights() {
    rsaMapLayer.removeAllFeatures();
    rsaIconLayer.removeAllFeatures();
}

function LabelDistance() {
    // Return object with two variables - label is the distance used to place the direction below the icon,
    // space is the space between geo points needed to render another icon
    let label_distance = {};
    switch (W.map.getOLMap().getZoom()) {
        case zm10:
            label_distance.label = 2;
            label_distance.space = 20;
            label_distance.icon = 1.1;
            break;
        case zm9:
            label_distance.label = 2;
            label_distance.space = 20;
            label_distance.icon = 2.2;
            break;
        case zm8:
            label_distance.label = 4;
            label_distance.space = 20;
            label_distance.icon = 4.5;
            break;
        case zm7:
            label_distance.label = 7;
            label_distance.space = 20;
            label_distance.icon = 8.3;
            break;
        case zm6:
            label_distance.label = 12;
            label_distance.space = 30;
            label_distance.icon = 17;
            break;
        case zm5:
            label_distance.label = 30;
            label_distance.space = 30;
            label_distance.icon = 34;
            break;
        case zm4:
            label_distance.label = 40;
            label_distance.space = 40;
            label_distance.icon = 68;
            break;
        case zm3:
            label_distance.label = 70;
            label_distance.space = 70;
            label_distance.icon = 140;
            break;
        case zm2:
            label_distance.label = 150;
            label_distance.space = 200;
            label_distance.icon = null;
            break;
        case zm1:
            label_distance.label = 200;
            label_distance.space = 250;
            label_distance.icon = null;
            break;
    }
    return label_distance;
}

rsaBootstrap();
