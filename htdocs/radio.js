//#region Radio Player

/** [[ implicit ]] The namespace for aliased objects. */
const Jo =
{
	/** [[ implicit ]] The aliased `window` object. */
	Win: window,
	/** [[ implicit ]] The aliased `document` object. */
	Doc: document
};

/** [[ implicit ]] The radio player object. */
const Player = Jo.Doc.getElementById( 'Player' );
Player.controls = false;

/** [[ constant ]] The radio player event mapper. */
const Ya = Object.freeze
({
	[ 'Invalid' ]: 'error',
	[ 'Stopped' ]: 'pause',
	[ 'Loading' ]: 'waiting',
	[ 'Running' ]: 'playing'
});

//#endregion

//#region Power Switch

/** [[ implicit ]] The power switch handle. */
const Po =
{
	/** [[ implicit ]] The power switch object for the radio player. */
	Obj: Jo.Doc.getElementById( 'Toggle' ),
	/** [[ constant ]] The inner text on the power switch. */
	Sym: Object.freeze
	({
		[ Ya.Invalid ]: '!!',
		[ Ya.Stopped ]: '|>',
		[ Ya.Loading ]: '|$',
		[ Ya.Running ]: '||'
	}),
	/** [[ constant ]] The title on the power switch. */
	Let: Object.freeze
	({
		[ Ya.Invalid ]: 'Failed.',
		[ Ya.Stopped ]: 'Play it.',
		[ Ya.Loading ]: 'Connecting...',
		[ Ya.Running ]: 'Pause it.'
	})
};

Jo.Win.addEventListener( 'load', ( ) => Po.Obj.focus( ) );
Po.Obj.addEventListener
(
	'click', ( ) =>
	{
		if( Player.paused )
		{ Player.muted = false; Player.play( ); }
		else
		{ Player.pause( ); Player.muted = true; }
		return;
	}
);

//#endregion

//#region Status Display

/** [[ implicit ]] The status display handle. */
const So =
{
	/** [[ implicit ]] The status display object. */
	Obj: Jo.Doc.getElementById( 'Status' ),
	/** [[ constant ]] The inner text on the status display. */
	Map: Object.freeze
	({
		[ Ya.Invalid ]: 'Something has gone wrong.',
		[ Ya.Stopped ]: 'Stay awhile and listen.',
		[ Ya.Loading ]: 'Wait a few moments...',
		[ Ya.Running ]: 'Have a nice day!'
	})
};

Object.keys( Ya ).map( ( X ) => Ya[ X ] ).forEach
(
	( Fire ) => Player.addEventListener
	(
		Fire, ( ) =>
		{
			Po.Obj.title = Po.Let[ Fire ];
			Po.Obj.innerText = Po.Sym[ Fire ];
			So.Obj.innerText = So.Map[ Fire ];
			return;
		}
	)
);
Player.dispatchEvent( new Event( Ya.Stopped ) );

//#endregion

//#region Volume Control

/** [[ constant ]] The keyboard event mapper. */
const Va = Object.freeze
({
	[ 'L' ]: 'ArrowLeft',
	[ 'U' ]: 'ArrowUp',
	[ 'R' ]: 'ArrowRight',
	[ 'D' ]: 'ArrowDown'
});

/** [[ constant ]] The basic volume control handle. */
const Vu = Object.freeze
({
	/** [[ constant ]] The maximum volume level. */
	Max: 8.0,
	/** [[ constant ]] The character set to draw the volume gauge. */
	M: { O: ':', I: '|' },
	/** [[ constant ]] Repeating `M` by `N` times. */
	Pu_: ( M, N ) =>
	{ let R = ''; while( 0.0 <= ( N-= 1.0 ) ) { R+= M; } return R; },
	/** [[ constant ]] Decreasing the volume level `V` by `1.0`, but not below `0.0`. */
	Dec_: ( V ) => { V-= 1.0; V = ( 0.0 > V )? 0.0: V; return V; },
	/** [[ constant ]] Increasing the volume level `V` by `1.0`, but not beyond `Vu.Max`. */
	Inc_: ( V ) => { V+= 1.0; V = ( Vu.Max < V )? Vu.Max: V; return V; },
	/** [[ constant ]] Drawing the volume level `V` compared to `Vu.Max`. */
	Bar_: ( V ) => ( Vu.Pu_( Vu.M.I, V ) + Vu.Pu_( Vu.M.O, Vu.Max - V ) ),
	/** [[ constant ]] Regularizing the volume level `V` by dividing by `Vu.Max`. */
	Reg_: ( V ) => ( V / Vu.Max )
});

/** [[ implicit ]] The advanced volume control handle. */
const Vi =
{
	/** [[ variable ]] The current volume level. */
	Now: Vu.Max,
	/** [[ variable ]] Decreasing the current volume level `Vi.Now` and applying it to `A`. */
	Dec_: ( A ) =>
	{ A.volume = Vu.Reg_( Vi.Now = Vu.Dec_( Vi.Now ) ); return; },
	/** [[ variable ]] Increasing the current volume level `Vi.Now` and applying it to `A`. */
	Inc_: ( A ) =>
	{ A.volume = Vu.Reg_( Vi.Now = Vu.Inc_( Vi.Now ) ); return; }
};

/** [[ implicit ]] The main volume control handle. */
const Vo =
{
	/** [[ implicit ]] The volume control object. */
	Box: Jo.Doc.getElementById( 'Handle' ),
	/** [[ implicit ]] The volume decreaser object. */
	Dec: Jo.Doc.getElementById( 'VolDec' ),
	/** [[ implicit ]] The volume increaser object. */
	Inc: Jo.Doc.getElementById( 'VolInc' ),
	/** [[ implicit ]] The volume gauge object. */
	Bar: Jo.Doc.getElementById( 'VolBar' ),
	/** [[ constant ]] Controlling the volume. */
	Map: Object.freeze
	({
		[ Va.L ]: Vi.Dec_,
		[ Va.U ]: Vi.Inc_,
		[ Va.R ]: Vi.Inc_,
		[ Va.D ]: Vi.Dec_
	})
};

Vo.Box.hidden = !Player.canPlayType;
Vo.Bar.addEventListener( 'keydown', ( Ev ) => Vo.Map[ Ev.key ]?.( ) );
Vo.Dec.addEventListener( 'click', ( ) => Vi.Dec_( Player ) );
Vo.Inc.addEventListener( 'click', ( ) => Vi.Inc_( Player ) );
Vo.Bar.addEventListener
(
	'click', ( Ev ) =>
	{
		const Ratio = Ev.offsetX / Vo.Bar.offsetWidth;
		Player.volume = Vu.Reg_( Vi.Now = Math.round( Ratio * Vu.Max ) );
		return;
	}
);

Player.addEventListener
(
	'volumechange', ( ) =>
	{
		const Ratio = 100.0 * Vu.Reg_( Vi.Now );
		Vo.Bar.title = `${ Ratio.toFixed( 1.0 ) }% loud.`;
		Vo.Bar.innerText = Vu.Bar_( Vi.Now );
		return;
	}
);
Player.dispatchEvent( new Event( 'volumechange' ) );

//#endregion
