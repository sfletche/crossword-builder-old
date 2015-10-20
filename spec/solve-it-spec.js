import '../auto_mock_off';
// import { fullToMyRight } from '../src/solve-it.js';

describe('solve-it', function() {
  var subject = require('../src/solve-it.js');

  describe('testAsync', function() {
    if (jasmine.version) { //the case for version 2.0.0
      console.log('jasmine-version:' + jasmine.version);
    }
    else { //the case for version 1.3
      console.log('jasmine-version:' + jasmine.getEnv().versionString());
    }
    // var test = subject.testAsync();
    // console.log('test: ', test);
    // var asyncResult = 'init';
    // beforeEach(function(done) {
    //   var state = ['h', '', ''];
    //   subject.testAsync(state)
    //     .then(function(result) {
    //       console.log('then ', result);
    //       console.log(done);
    //       asyncResult = result;
    //       done();
    //     })
    //     .catch(function() {
    //       console.log('catch');
    //       console.log(done);
    //       asyncResult = 'catch';
    //       done();
    //     });
    // });

    it("tests the test", function(async) {
      expect(subject.testingTheTest()).toEqual('fail');
    });


    describe("Asynchronous specs", function() {
      var value, flag;

      it("should support async execution of test preparation and expectations", function(asdf) {
        runs(function() {
          flag = false;
          value = 0;

          setTimeout(function() {
            flag = true;
          }, 100);
        });

        waitsFor(function() {
          value++;
          return flag;
        }, "The Value should be incremented", 750);

        runs(function() {
          expect(value).toBeGreaterThan(0);
        });
      });
    });




    iit('does something', function(done) {
      var state = ['h', '', ''];
      // console.log('it', asyncResult);
      // expect(asyncResult).toEqual('success');
      var success = function(result) {
        console.log('result ', result);
        expect(result).toEqual('asdf');
      };
      subject.testAsync(state)
        .then(function(result) {
          console.log('then ', result);
          console.log('done ', done);
          success(result);
          expect(result).toEqual('fail');
          done();
        });
      // expect(subject.testAsync(state)).toEqual('success');
      // done();

    });

    // iit("does something first", function(done) {
    //   var state = ['h', '', ''];
    //   subject.testAsync(state)
    //     .then(function(result) {
    //       expect(true).toEqual(false);
    //       console.log('result: ' + result);
    //       expect(result).toEqual('fail');
    //       done();
    //     })
    //     .catch(function() {
    //       expect(true).toEqual(false);
    //     });
    // });

  });
  xdescribe('getWordLists', function() {
    it('does something', function() {
      var state = ['h', '', ''];
      expect(subject.getWordLists(state)).toEqual(false);
    });
  });
});