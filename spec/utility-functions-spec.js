import '../auto_mock_off';
// import { fullToMyRight } from '../src/solve-it.js';

xdescribe('utility-functions', function() {
  var subject = require('../src/utility-functions.js');

  describe('fullToMyRight', function() {
    it('returns true when word starting at arg is already populated', function() {
      expect(subject.fullToMyRight('cw-1-3')).toEqual(true);
    });
    it('returns false when word starting at arg is already populated', function() {
      expect(subject.fullToMyRight('cw-2-2')).toEqual(false);
    });
  });
});