// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
/*https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/b3cHThCyxrncuCeSO-SYvabwLNzKydHe1vgPPRra41-TOBk?api_key=[APIKEY] */
//example request for summoner ID given summoner name (looeegee)
/*https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/looeegee?api_key=[APIKEY]*/
let apiKey = 'RGAPI-7f54d091-7185-40fd-a0fd-9488eaeeffee'; //refreshes every day
let summonerName = 'looeegee';

let summonerIDObj = await getSummoner();
let summonerDataObj = await getSummonerData(summonerIDObj);


let widget = await createWidget(summonerDataObj)
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

async function createWidget(summObjArray) {
  console.log(summObjArray)
  let summObj = summObjArray[0]
	let appIcon = await getSummonerIcon()
  let title = "Opgg clone"
  let widget = new ListWidget()
  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("141414"),
    new Color("13233F")
  ]
  widget.backgroundGradient = gradient
  // Show app icon and title
  let titleStack = widget.addStack()
  let appIconElement = titleStack.addImage(appIcon)
  appIconElement.imageSize = new Size(15, 15)
  appIconElement.cornerRadius = 4
  titleStack.addSpacer(4)
  let titleElement = titleStack.addText(title)
  titleElement.textColor = Color.white()
  titleElement.textOpacity = 0.7
  titleElement.font = Font.mediumSystemFont(13)
  widget.addSpacer(12)
  // Show API
  let nameElement = widget.addText(summObj.tier)
  nameElement.textColor = Color.white()
  nameElement.font = Font.boldSystemFont(18)
  widget.addSpacer(2)
  let descriptionElement = widget.addText(summObj.queueType)
  descriptionElement.minimumScaleFactor = 0.5
  descriptionElement.textColor = Color.white()
  descriptionElement.font = Font.systemFont(18)
  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8)
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward")
    let footerStack = widget.addStack()
    let linkStack = footerStack.addStack()
    linkStack.centerAlignContent()
    linkStack.url = "twitter.com/home"
    let linkElement = linkStack.addText("Read more")
    linkElement.font = Font.mediumSystemFont(13)
    linkElement.textColor = Color.blue()
    linkStack.addSpacer(3)
    let linkSymbolElement = linkStack.addImage(linkSymbol.image)
    linkSymbolElement.imageSize = new Size(11, 11)
    linkSymbolElement.tintColor = Color.blue()
    footerStack.addSpacer()
    // Add link to documentation
    let docsSymbol = SFSymbol.named("book")
    let docsElement = footerStack.addImage(docsSymbol.image)
    docsElement.imageSize = new Size(20, 20)
    docsElement.tintColor = Color.white()
    docsElement.imageOpacity = 0.5
    docsElement.url = "https://docs.scriptable.app"
  }
  return widget
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

async function getSummonerIcon() {
	let url = "https://opgg-static.akamaized.net/images/profile_icons/profileIcon4151.jpg?image=q_auto:best&v=1518361200" //taken from opgg, replace icon number with variable
	let req = new Request(url)
	return await req.loadImage();
}