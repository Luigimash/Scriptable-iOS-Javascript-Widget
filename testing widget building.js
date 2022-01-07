// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;

//PULLING FROM RIOT API
let apiKey ='RGAPI-16b22c45-d239-4d9f-9e45-eaffa2142240' //refreshes every day
//let summonerName = args.widgetParameter;
let summonerName = args.widgetParameter;

let summonerIDObj = await getSummoner();
let summonerDataObj = await getSummonerData(summonerIDObj);
//PULLING FROM RIOT API\\


let widget = await createWidget(summonerDataObj, summonerIDObj)
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(sumDataObj,sumIdObj) {
	    //Check what ranked queues the user has played
			
	let soloduo = -1;
	let flex = -1;
	let tft = -1;
	//variables store index in sumDataObj of each queue type 
	if (sumDataObj.length > 1) {
		count = 0;
		sumDataObj.forEach(obj => {
			if (obj.queueType === 'RANKED_FLEX_SR') {
				flex = count;
			}
			else if (obj.queueType === 'RANKED_SOLO_5x5') {
				soloduo = count;
			}
			else {
				tft = count;
			}
			count++;
		});
	}
	
	let highestRankObj = getHighestRank(sumDataObj); //keys: rankName, rankNum, tierRoman, tierNumber, index
	let colorObject = pickRankColor(highestRankObj); //keys: textColor, botColor, topColor

console.log(highestRankObj);
	
  let widget = new ListWidget()
  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(colorObject.topColor),
    new Color(colorObject.botColor)
  ]
  widget.backgroundGradient = gradient

	let topStack = widget.addStack();
	topStack.layoutHorizontally();
	let summIconStack = topStack.addStack();
	//loading summoner icon
	const summIconImage = await getSummonerIcon(sumIdObj.profileIconId);
	let summIcon = summIconStack.addImage(summIconImage);    
    let summSize = new Size(70,70);
    summIconStack.size=summSize;
    summIconStack.setPadding(10,0,0,0);
	
topStack.addSpacer(20);
	let titleStack = topStack.addStack();
	let titleText = titleStack.addText(sumIdObj.name);
	titleText.font = Font.boldSystemFont(30);
titleStack.setPadding(20,0,20,0);
 titleStack.size=new Size(130,80)
 titleText.minimumScaleFactor=0.8

topStack.addSpacer(10);
	let rankedIconStack = topStack.addStack();
	//loading ranked icon
	const rankedIconImage = await getRankedIcon(highestRankObj);
	let rankedIcon = rankedIconStack.addImage(rankedIconImage);
    let rankedSize = new Size(90,90);
    rankedIconStack.size=rankedSize;

	if (soloduo != -1) {
		//soloduo stack
		let midStack = widget.addStack();
		midStack.layoutHorizontally();
			
		midLeftStack = midStack.addStack();
		midLeftText = midLeftStack.addText('Ranked Solo/Duo:');
		midLeftText.font = Font.semiboldMonospacedSystemFont(20);
			
		midMidStack = midStack.addStack();
		midMidText = midStack.addText(` ${sumDataObj[soloduo].tier} ${sumDataObj[soloduo].rank} `);
		midMidText.font = Font.mediumSystemFont(20);
		midMidText.textColor = new Color(colorObject.textColor);
			
		midRightStack = midStack.addStack(); 
		midRightText = midRightStack.addText(`${sumDataObj[soloduo].leaguePoints} lp`);
		midRightText.font=Font.ultraLightRoundedSystemFont(20);
	}
		
	if (flex != -1) {
		//flex stack
		let botStack = widget.addStack();
		botStack.layoutHorizontally();
			
		botLeftStack = botStack.addStack();
		botLeftText = botLeftStack.addText('Ranked Flex 5v5:');
		botLeftText.font = Font.semiboldMonospacedSystemFont(20);
		botStack.addSpacer(6);
		
		botMidStack = botStack.addStack();
		botMidText = botStack.addText(` ${sumDataObj[flex].tier} ${sumDataObj[flex].rank} `);
		botMidText.font = Font.mediumSystemFont(20);
		botMidText.textColor = new Color(colorObject.textColor);
		
		botRightStack = botStack.addStack(); 
		botRightText = botRightStack.addText(`${sumDataObj[flex].leaguePoints} lp`);
		botRightText.font=Font.ultraLightRoundedSystemFont(20);
	}
	
	if (tft != -1 && sumDataObj.length < 3) {
		//tft stack
		let botStack = widget.addStack();
		botStack.layoutHorizontally();
			
		botLeftStack = botStack.addStack();
		botLeftText = botLeftStack.addText('Ranked TFT: ');
		botLeftText.font = Font.semiboldMonospacedSystemFont(20);
		botStack.addSpacer(19);
		
		botMidStack = botStack.addStack();
		botMidText = botStack.addText(` ${sumDataObj[tft].wins} wins `);
		botMidText.font = Font.mediumSystemFont(20);
		botMidText.textColor = new Color(colorObject.textColor);
		
		botRightStack = botStack.addStack(); 
		botRightText = botRightStack.addText(`${sumDataObj[tft].losses} losses`);
		botRightText.font=Font.ultraLightRoundedSystemFont(20);
	}
	
	
  return widget;
}

async function loadIcon(url) {
  let req = new Request(url)
  return req.loadImage()
}
	
	
	
async function getSummoner () {
	let url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;
	let req = new Request(url)
	return await req.loadJSON();
} //returns object of summoner identification (ID, account ID, puuid, name, etc); is the SUMMONER-v4 API 

async function getSummonerData (idObj) {
  console.log(idObj);
	let url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${idObj.id}?api_key=${apiKey}`;
	let req = new Request(url)
	return await req.loadJSON();
} //returns object ARRAY of summoner data (rank,lp,wins,losses, etc ); is the LEAGUE-V4 API
 //array has one object for every ranked queue (flex, solo)

async function getSummonerIcon(num) {
	let url = `https://opgg-static.akamaized.net/images/profile_icons/profileIcon${num}.jpg?image=q_auto:best&v=1518361200` //taken from opgg, replace icon number with variable
	let req = new Request(url)
	return await req.loadImage();
}


async function getRankedIcon(obj) {
	let url = `https://opgg-static.akamaized.net/images/medals/${obj.rankName.toLowerCase()}_${obj.tierNumber}.png?image=q_auto:best&v=1`;
	let req = new Request(url)
	return await req.loadImage();
}

function numeralToNumber(numeral) {
	if (numeral === "I") {
		return 1;
	}
	else if (numeral === "II") {
		return 2;
	}
	else if (numeral === "III") {
		return 3;
	}
	else if (numeral === "IV") {
		return 4;
	}
	else if (numeral === "V") {
		return 5;
	}
	else {
		return 0;
		console.log('Bad roman numeral conversion in convertNumeralToNumber');
	}
}

function getHighestRank(obj) { //returns highest rank as an object array 

	let highestRankName = " ";
	let highestRank=110;
	let highTier = ' ';
	let highTierNumber = 90;
	let highestIndex = -1;
	/*
	challenger = 1
	gm = 2
	m = 3
	d = 4
	p = 5
	g = 6
	s = 7
	b = 8
	i = 9
	*/
	obj.forEach((ele,index) => {
		numeral = ele.rank;
		rankNumber = numeralToNumber(numeral);

		if (ele.tier === "CHALLENGER") {
			highestRankName = "CHALLENGER";
			highestRank = 1; 
			highTier = 'I';
			highTierNumber = 1;
			highestIndex = index;
		}
		else if (ele.tier === "GRANDMASTER" && highestRank > 2) {
			highestRankName = "GRANDMASTER";
			highestRank = 2; 
			highTier = 'I';
			highTierNumber = 1;
			highestIndex = index;
		}
		else if (ele.tier === "MASTER" && highestRank > 3) {
			highestRankName = "MASTER";
			highestRank = 3; 
			highTier = 'I';
			highTierNumber = 1;
			highestIndex = index;
		}
		else if (ele.tier === "DIAMOND" && (highestRank > 4 || (highestRank === 4 && rankNumber < highTierNumber))){
			highestRankName = "DIAMOND";
			highestRank = 4; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
		else if (ele.tier === "PLATINUM" && (highestRank > 5|| (highestRank === 5 && rankNumber < highTierNumber))) {
			highestRankName = "PLATINUM";
			highestRank = 5; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
		else if (ele.tier === "GOLD" && (highestRank > 6|| (highestRank === 6 && rankNumber < highTierNumber))) {
			highestRankName = "GOLD";
			highestRank = 6; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
		else if (ele.tier === "SILVER" && (highestRank > 7|| (highestRank === 7 && rankNumber < highTierNumber))) {
			highestRankName = "SILVER";
			highestRank = 7; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
		else if (ele.tier === "BRONZE" && (highestRank > 8|| (highestRank === 8 && rankNumber < highTierNumber))) {
			highestRankName = "BRONZE";
			highestRank = 8; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
		else if (ele.tier === "IRON" && (highestRank > 9|| (highestRank === 9 && rankNumber < highTierNumber))) {
			highestRankName = "IRON";
			highestRank = 9; 
			highTier = ele.rank;
			highTierNumber = rankNumber
			highestIndex = index;
		}
	}); //exiting foreach
	
	
	return { rankName: highestRankName, rankNum:highestRank, tierRoman:highTier, tierNumber:highTierNumber, index:highestIndex };
	//keys: rankName, rankNum, tierRoman, tierNumber, index
}

function pickRankColor(obj) { //returns object containing text color, gradient background colors 
	//param obj keys: rankName, rankNum, tierRoman, tierNumber, index
	if (obj.rankNum === 1) {
		return { textColor:"CED2F7", botColor:"BA805C", topColor: "03104C" }
	}
	else if (obj.rankNum === 2) {
		return { textColor:"ffc1c1", botColor:"991a1e", topColor: "5D3F42" }
	}
	else if (obj.rankNum === 3) {
		return { textColor:"EF63F4", botColor:"472d5d", topColor: "0f010f" }
	}
	else if (obj.rankNum === 4) {
		return { textColor : "CED2F7", botColor: "13233F", topColor: "141414" }
	}
	else if (obj.rankNum === 5) {
		return { textColor : "50FAAA", botColor : "224142", topColor: "161C21" }
	}
	else if (obj.rankNum === 6) {
		return { textColor: "F4CD71", botColor :"794920", topColor: "261305" }
	}
	else if (obj.rankNum === 7) {
		return { textColor : "D2DBDD", botColor : "46575D", topColor: "000205" }
	}
	else if (obj.rankNum === 8) {
		return { textColor : "D0AE8E", botColor :"4F2318", topColor: "000000" }
	}
    else if (true){//(obj.rankNum === 9) {
         return { textColor: "C8C6C2", botColor: "403331", topColor: "211F1F" }
  }
    	else {
		return { textColor : "CED2F7", botColor : "13233F", topColor: "141414" }
	}
} //keys: textColor, botColor, topColor