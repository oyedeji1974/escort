const locations = {
usa: {
Alabama: ["Birmingham","Huntsville","Montgomery","Mobile","Tuscaloosa","Hoover","Decatur","Dothan","Auburn","Madison"],
    Alaska: ["Anchorage","Fairbanks","Juneau","Sitka","Wasilla","Ketchikan","Kenai","Kodiak","Bethel","Palmer"],
    Arizona: ["Phoenix","Mesa","Scottsdale","Tucson","Glendale","Chandler","Gilbert","Tempe","Peoria","Surprise"],
    Arkansas: ["Little Rock","Fayetteville","Fort Smith","Springdale","Jonesboro","North Little Rock","Conway","Rogers","Pine Bluff","Bentonville"],
    California: ["Los Angeles","San Diego","San Jose","Fresno","Sacramento","Long Beach","Oakland","Bakersfield","Anaheim","Santa Ana"],
    Colorado: ["Denver","Colorado Springs","Aurora","Boulder","Fort Collins","Lakewood","Thornton","Arvada","Westminster","Pueblo"],
    Connecticut: ["Bridgeport","New Haven","Hartford", "Stamford","Waterbury","Norwalk","Danbury","New Britain","Meriden","Bristol"],
    Delaware: ["Wilmington","Dover","Newark","Middletown","Smyrna","Milford","Seaford","Georgetown","Elkton","Lewes"],
    Florida: ["Miami","Orlando","Tampa","Jacksonville","St. Petersburg","Hialeah","Port St. Lucie","Cape Coral","Fort Lauderdale","Pembroke Pines"],
    Georgia: ["Atlanta","Savannah","Augusta"],
    Hawaii: ["Honolulu","Hilo","Pearl City"],
    Idaho: ["Boise","Meridian","Nampa","Idaho Falls","Pocatello"],
    Illinois: ["Chicago","Aurora","Naperville","Joliet","Rockford","Springfield","Elgin","Peoria","Champaign","Waukegan"],
    Indiana: ["Indianapolis","Fort Wayne","Evansville","South Bend","Carmel","Bloomington","Fishers","Hammond","Gary","Muncie"],
    Iowa: ["Des Moines","Cedar Rapids"," Davenport","Sioux City","Iowa City","Waterloo","Council Bluffs","Ames","West Des Moines","Muscatine"],
    Kansas: ["Wichita","Kansas City","Overland Park","Olathe","Topeka","Lawrence","Shawnee","Manhattan","Lenexa","Salina"],
    Kentucky: ["Louisville","Lexington","Bowling Green","Owensboro","Covington","Hopkinsville","Richmond","Florence","Murray","Danville"],
    Louisiana: ["New Orleans","Baton Rouge","Shreveport","Lafayette","Lake Charles","Kenner","Bossier City","Monroe","Alexandria","Houma"],
    Maine: ["Portland","Lewiston","Bangor","South Portland","Auburn","Biddeford","Sanford","Saco","Augusta","Westbrook"],
    Maryland: ["Baltimore","Annapolis","Frederick","Rockville","Gaithersburg","Bowie","Hagerstown","Cumberland","Salisbury","College Park"],
    Massachusetts: ["Boston","Springfield","Cambridge","Lowell","Worcester","New Bedford","Quincy","Lynn","Fall River","Newton"],
    Michigan: ["Detroit","Grand Rapids","Ann Arbor","Lansing","Flint","Dearborn","Sterling Heights","Troy","Farmington Hills","Kalamazoo"],
    Minnesota: ["Minneapolis","Saint Paul","Rochester","Bloomington","Duluth","Eagan","Burnsville","Blaine","Maple Grove","Woodbury"],
    Mississippi: ["Jackson","Gulfport","Southaven","Hattiesburg","Biloxi","Meridian","Tupelo","Olive Branch","Greenville","Horn Lake"],
    Missouri: ["Kansas City","St Louis","Springfield","Columbia","Independence","Lee's Summit","O'Fallon","St Joseph","St Charles","St Peters"],
    Montana: ["Billings","Missoula","Great Falls","Bozeman","Butte","Helena","Kalispell","Havre","Anaconda","Miles City"],
    Nebraska: ["Omaha","Lincoln", "Bellevue","Grand Island","Kearney","Fremont","Hastings","North Platte","Norfolk","Columbus"],
    Nevada: ["Las Vegas","Reno","North Las Vegas","Henderson","Sparks","Carson City","Elko","Mesquite","Pahrump","Fernley"],
    NewHampshire: ["Manchester","Nashua","Concord","Derry","Dover","Rochester","Salem","Merrimack","Hudson","Londonderry"],
    NewJersey: ["Newark","Jersey City","Atlantic City","Paterson","Elizabeth","Edison","Woodbridge","Lakewood","Toms River","Clifton"],
    NewMexico: ["Albuquerque","Santa Fe","Las Cruces","Rio Rancho","Roswell","Farmington","Clovis","Hobbs","Carlsbad","Gallup"],
    NewYork: ["New York City","Buffalo","Rochester","Yonkers","Syracuse","Albany","New Rochelle","Mount Vernon","Schenectady","Utica"],
    NorthCarolina: ["Charlotte","Raleigh","Greensboro","Winston-Salem","Durham","Fayetteville","Cary","Wilmington","High Point","Greenville"],
    NorthDakota: ["Fargo","Bismarck","Grand Forks","Minot","West Fargo","Williston","Dickinson","Mandan","Jamestown","Valley City"],
    Ohio: ["Columbus","Cleveland","Cincinnati","Toledo","Akron","Dayton","Parma","Canton","Youngstown","Lorain"],
    Oklahoma: ["Oklahoma City","Tulsa","Norman","Broken Arrow","Edmond","Lawton","Moore","Midwest City","Enid","Stillwater"],
    Oregon: ["Portland","Salem","Eugene","Gresham","Hillsboro","Beaverton","Bend","Medford","Springfield","Corvallis"],
    Pennsylvania: ["Philadelphia","Pittsburgh","Allentown","Erie","Reading","Scranton","Bethlehem","Lancaster","Harrisburg","York"],
    RhodeIsland: ["Providence","Warwick","Cranston","Pawtucket","East Providence","Woonsocket","Coventry","Cumberland","North Providence","South Kingstown","Johnston"],
    SouthCarolina: ["Charleston","Columbia","North Charleston","Mount Pleasant","Rock Hill","Greenville","Summerville","Goose Creek","Hilton Head Island","Florence"],
    SouthDakota: ["Sioux Falls","Rapid City","Pierre","Aberdeen","Brookings","Watertown","Mitchell","Yankton","Vermillion","Huron","Madison"],
    Tennessee: ["Nashville","Memphis","Knoxville","Chattanooga","Clarksville","Murfreesboro","Franklin","Jackson","Johnson City","Bartlett"],
    Texas: ["Houston","Dallas","Austin","San Antonio","Fort Worth","El Paso","Arlington","Corpus Christi","Plano","Laredo"],
    Utah: ["Salt Lake City","Provo","West Valley City","West Jordan","Orem","Sandy","Ogden","St George","Layton","Taylorsville","South Jordan"],
    Vermont: ["Burlington","South Burlington","Rutland","Barre","Montpelier","St Albans","Winooski","Middlebury","Essex Junction","Bennington"],
    Virginia: ["Virginia Beach","Richmond","Norfolk","Chesapeake","Arlington","Newport News","Alexandria","Hampton","Roanoke","Portsmouth"],
    Washington: ["Seattle","Spokane","Tacoma","Vancouver","Bellevue","Kent","Everett","Renton","Federal Way","Yakima","Bellingham"],
    WestVirginia: ["Charleston","Huntington","Morgantown","Parkersburg","Wheeling","Weirton","Fairmont","Martinsburg","Clarksburg","South Charleston","Vienna"],
    Wisconsin: ["Milwaukee","Madison","Green Bay","Kenosha","Racine","Appleton","Waukesha","Eau Claire","Oshkosh","Janesville","West Allis"],
    Wyoming: ["Cheyenne","Casper","Laramie","Gillette","Rock Springs","Sheridan","Green River","Evanston","Cody","Buffalo","Rawlins"]
},

canada:{
Alberta:["Calgary","Edmonton","Red Deer","Lethbridge","St Albert","Medicine Hat","Grande Prairie","Airdrie","Spruce Grove","Lloydminster"],
BritishColumbia:["Vancouver","Victoria","Surrey","Burnaby","Richmond","Kelowna","Abbotsford","Coquitlam","Langley","Saanich"],
Manitoba:["Winnipeg","Brandon","Steinbach","Thompson","Portage la Prairie","Winkler","Selkirk","Morden","Dauphin","Flin Flon"],
NewBrunswick:["Moncton","Saint John","Fredericton","Dieppe","Miramichi","Edmundston","Campbellton","Bathurst","Caraquet","Shippagan"],
NewfoundlandAndLabrador:["St Johns","Corner Brook","Mount Pearl","Gander","Grand Falls-Windsor","Happy Valley-Goose Bay","Labrador City","Carbonear","Stephenville","Clarenville"],
NovaScotia:["Halifax","Sydney","Dartmouth","Truro","New Glasgow","Glace Bay","Bridgewater","Kentville","Amherst","Pictou"],
Ontario:["Toronto","Ottawa","Mississauga","Hamilton","London","Brampton","Markham","Vaughan","Kitchener","Windsor"],
PrinceEdwardIsland:["Charlottetown","Summerside","Stratford","Cornwall","Montague","Souris","Kensington","Alberton","O'Leary","Tignish"],
Quebec:["Montreal","Quebec City","Laval","Gatineau","Sherbrooke", "Trois-Rivieres","Longueuil","Saguenay","Levis","Terrebonne"],
Saskatchewan:["Saskatoon","Regina","Prince Albert","Moose Jaw","Swift Current","Yorkton","North Battleford","Estevan","Weyburn","Martensville"],

NorthwestTerritories:["Yellowknife","Hay River","Inuvik","Fort Smith","Behchoko","Tuktoyaktuk","Norman Wells","Fort Simpson","Aklavik","Sachs Harbour"],
Nunavut:["Iqaluit", "Clyde River","Rankin Inlet","Arviat","Baker Lake","Cambridge Bay","Grise Fiord","Pangnirtung","Resolute","Sanikiluaq"],
Yukon:["Whitehorse"," Dawson City","Watson Lake","Haines Junction","Carcross","Mayo","Faro","Old Crow","Burwash Landing","Teslin"]
},
europe:{
UK:["London","Manchester","Birmingham","Liverpool","Leeds","Glasgow","Sheffield","Bradford","Edinburgh","Liverpool"],
France:["Paris","Lyon","Marseille","Nice","Toulouse","Bordeaux","Lille","Rennes","Reims","Saint-Etienne"],
Germany:["Berlin","Hamburg","Munich","Frankfurt","Cologne","Düsseldorf","Stuttgart","Dortmund","Essen","Leipzig"],
Spain:["Madrid","Barcelona","Valencia"],
Italy:["Rome","Milan","Naples","Florence"]
},

asia:{
UAE:["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain"],
Thailand:["Bangkok","Phuket","Pattaya"],
Japan:["Tokyo","Osaka","Yokohama"],
Philippines:["Manila","Cebu","Davao"]
},

latinamerica:{
Mexico:["Mexico City","Cancun","Guadalajara"],
Brazil:["Rio de Janeiro","Sao Paulo","Brasilia"],
Argentina:["Buenos Aires","Cordoba"],
Colombia:["Bogota","Medellin","Cartagena"]
},

oceania:{
Australia:["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Logan City"],
NewZealand:["Auckland","Wellington","Christchurch","Dunedin","Hamilton","Tauranga","Napier","Rotorua","Whangarei","Invercargill"]
},

};