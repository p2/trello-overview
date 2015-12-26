/**
 *  One script to rule them all.
 */

function launchApp() {
	Trello.authorize({
		interactive: false,
		success: onAuthorize,
	});
}

function onAuthorize() {
	updateLoggedIn();
	scheduleRefresh();
	var parent = $('#boards');
	parent.empty().append($('<p>').addClass('bigcenter').text("Loading Cards..."));
	
	Trello.members.get("me", function(member){
		$("#fullName").text(member.fullName);
		
		// list my cards by board
		Trello.get("members/me/cards", function(cards) {
			var boards = cardsByBoard(cards);
			var rendered = $(Mustache.render($('#template').html(), {'boards': boards}));
			parent.empty().append(rendered);
			loadBoardAttributes(boards);
		});
	},
	function(xhr, status, error) {
		// we end up here if we call Trello.authorize with interactive = false
		// need to force a logout and then do a login to see our cards
		if ((error && "unauthorized" == error.toLowerCase()) || (error && error.includes('401'))) {
			logout();
			login();
		}
	});
}

function updateLoggedIn() {
	var isLoggedIn = Trello.authorized();
	$('.loggedout').toggle(!isLoggedIn);
	$('.loggedin').toggle(isLoggedIn);        
}

function login() {
	Trello.authorize({
		type: "popup",
		success: onAuthorize,
	});
}
 
function logout() {
	Trello.deauthorize();
	updateLoggedIn();
}


// MARK: - Auto-Refresh

var _refreshDelaySecs = 1800;
var _refreshTimeout = null

function scheduleRefresh() {
	clearRefresh();
	if (_refreshDelaySecs > 0) {
		_refreshTimeout = window.setTimeout(doRefresh, _refreshDelaySecs*1000);
	}
}

function doRefresh() {
	clearRefresh();
	onAuthorize();
}

function clearRefresh() {
	if (_refreshTimeout) {
		window.clearTimeout(_refreshTimeout);
		_refreshTimeout = null;
	}
}


// MARK: - Boards & Cards

function cardsByBoard(cards) {
	var allBoards = {};
	$.each(cards, function(idx, card) {
		card.dueDate = card.due ? (new Date(card.due)).toLocaleDateString() : null;
		
		var board = allBoards[card.idBoard] || {'id': card.idBoard, 'cards': []};
		board.cards.push(card);
		allBoards[card.idBoard] = board;
	});
	
	// sort board cards by due date
	var boards = [];
	for (b in allBoards) {
		var board = allBoards[b];
		board.cards.sort(function(a, b) {
			if (a.due && b.due) {
				return a.due < b.due;
			}
			if (a.due) {
				return -1;
			}
			if (b.due) {
				return 1
			}
			if (a.name < b.name) {
				return -1;
			}
			return 1;
		});
		boards.push(board);
	}
	
	// sort boards by num cards
	boards.sort(function(a, b) {
		if (a.cards.length > b.cards.length) {
			return -1;
		}
		return (a.cards.length < b.cards.length) ? 1 : 0;
	});
	
	return boards;
}

function loadBoardAttributes(boards) {
	$.each(boards, function(idx, board) {
		Trello.boards.get(
			board.id,
			{fields: 'id,name,shortUrl,idOrganization,prefs'},
			function(data, status, xhr) {
				var brd = $('#board_'+data.id);
				brd.find('a').css('color', data.prefs.backgroundColor);
				
				var brdLink = $('<a>').text(data.name).attr('href', data.shortUrl).attr('target', '_blank');
				brd.find('.boardname').empty().append(brdLink);
				
				if (data.idOrganization) {
					brd.find('.orgname').addClass('org_'+data.idOrganization)
					loadOrgAttributes(data.idOrganization);
				}
				else {
					brd.find('.orgname').html('<i>–</i>');
				}
			},
			function(xhr, status, message) {
				console.error('loadBoardAttributes failed', xhr, status, message);
			}
		);
	});
}

var loadingOrg = [];
var loadedOrgAttributes = {};
function loadOrgAttributes(org_id) {
	if (loadedOrgAttributes[org_id]) {
		applyOrgAttributes(org_id)
	}
	else if (!loadingOrg[org_id]) {
		loadingOrg[org_id] = true;
		Trello.organizations.get(
			org_id,
			{fields: 'id,name,displayName,url'},		// logoHash could be cool, too
			function(data, status, xhr) {
				loadingOrg[org_id] = false;
				loadedOrgAttributes[data.id] = data;
				applyOrgAttributes(org_id);
			},
			function(xhr, status, message) {
				loadingOrg[org_id] = false;
				console.error('loadOrgAttributes failed', xhr, status, message);
			}
		);
	}
}

function applyOrgAttributes(org_id) {
	var org = loadedOrgAttributes[org_id];
	$('#boards').find('.org_'+org_id).html('<a href='+org.url+' target="_blank">'+org.displayName+'</a>');
}
						  
