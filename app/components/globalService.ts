
'use strict';

export var mainTabRef;

export var pushToken = '';

export var isWhatsNext = false;

export var getPastTimeString = function (duration) {
    var dur = (duration - duration % 1000) / 1000;
    var ss, mm, hh, dd, oo, yy;

    ss = dur % 60; dur = (dur - ss) / 60;
    mm = dur % 60; dur = (dur - mm) / 60;
    hh = dur % 24; dur = (dur - hh) / 24;
    dd = dur % 30; dur = (dur - dd) / 30;
    oo = dur % 12; yy = (dur - oo) / 12;

    if (yy > 0)
      	return yy + 'y';
    else if (oo > 0)
      	return oo + 'm';
    else if (dd > 0)
      	return dd + 'd';
    else if (hh > 0)
      	return hh + 'h';
    else if (mm > 0)
      	return mm + 'm';
    else if (ss > 0)
      	return ss + 's';
    else
      	return '1s';
}
