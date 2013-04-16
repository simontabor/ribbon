var ribbon = require('../lib/ribbon'),
    should = require('should');

var amqpOpts = { client: { host: 'rabbitmq-1-local'} };

var setUpConnection = function(opts, cb){
  if(typeof opts == 'function'){
    cb = opts;
    opts = amqpOpts;
  }

  var amqp = ribbon.wrap('amqp', opts);
  amqp.startUp(function(err){
    cb(err, amqp);
  });
};

describe('AMQP adaptor', function(){
  /** Starting and stopping **/
  var c;

  it('invokes callback without error on successful startup', function(done){
    setUpConnection(amqpOpts, function(err, adaptor){
      should.not.exist(err);
      adaptor.isUp().should.equal(true);
      adaptor.isDown().should.equal(false);
      done();
      c = adaptor;
    });
  });

  it('invokes callback with error on failed startup', function(done){
    setUpConnection({}, function(err, adaptor){
      should.exist(err);
      adaptor.isUp().should.equal(false);
      adaptor.isDown().should.equal(true);
      done();
    });
  });

  it('invokes callback without error on successful shutdown', function(done){
    c.shutDown(done);
  });

  it('reconnects if connection severed', function(done){
    setUpConnection(amqpOpts, function(err, adaptor){
      should.not.exist(err);
      adaptor.on('revived', done);
      adaptor.getClient().destroy();
    });
  });
});