(function(angular) {
  'use strict';

  angular.module('linagora.esn.contact')
    .factory('ContactLiveUpdate', ContactLiveUpdate);

  function ContactLiveUpdate(
    $rootScope,
    $log,
    livenotification,
    contactService,
    ContactShellBuilder,
    contactAvatarService,
    contactAddressbookService,
    CONTACT_EVENTS,
    CONTACT_WS,
    CONTACT_ADDRESSBOOK_EVENTS
  ) {
    var sio = null;
    var listening = false;

    return {
      startListen: startListen,
      stopListen: stopListen
    };

    function startListen(bookId) {
      if (listening) { return; }

      if (sio === null) {
        sio = livenotification(CONTACT_WS.room, bookId);
      }
      sio.on(CONTACT_WS.events.CREATED, onCreate);
      sio.on(CONTACT_WS.events.DELETED, onDelete);
      sio.on(CONTACT_WS.events.UPDATED, onUpdate);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_CREATED, onAddressbookCreate);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_DELETED, onAddressbookDelete);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_UPDATED, onAddressbookUpdate);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_DELETED, onAddressbookSubscriptionDelete);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_UPDATED, onAddressbookSubscriptionUpdate);
      sio.on(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_CREATED, onAddressbookSubscriptionCreate);

      listening = true;
      $log.debug('Start listening contact live update');
    }

    function stopListen() {
      if (!listening) { return; }

      if (sio) {
        sio.removeListener(CONTACT_WS.events.CREATED, onCreate);
        sio.removeListener(CONTACT_WS.events.DELETED, onDelete);
        sio.removeListener(CONTACT_WS.events.UPDATED, onUpdate);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_CREATED, onAddressbookCreate);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_DELETED, onAddressbookDelete);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_UPDATED, onAddressbookUpdate);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_DELETED, onAddressbookSubscriptionDelete);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_UPDATED, onAddressbookSubscriptionUpdate);
        sio.removeListener(CONTACT_WS.events.ADDRESSBOOK_SUBSCRIPTION_CREATED, onAddressbookSubscriptionCreate);
      }

      listening = false;
      $log.debug('Stop listening contact live update');
    }

    function onCreate(data) {
      ContactShellBuilder.fromWebSocket(data).then(function(shell) {
        contactAvatarService.injectTextAvatar(shell);
        $rootScope.$broadcast(CONTACT_EVENTS.CREATED, shell);
      }, function() {
        $log.debug('Can not build the contact from websocket data');
      });
    }

    function onDelete(data) {
      $rootScope.$broadcast(CONTACT_EVENTS.DELETED, { id: data.contactId });
    }

    function onUpdate(data) {
      contactService.getContact({ bookId: data.bookId, bookName: data.bookName }, data.contactId)
        .then(function(updatedContact) {
          $rootScope.$broadcast(CONTACT_EVENTS.UPDATED, updatedContact);
        }, function(err) {
          $log.error('Can not get contact', err);
        });
    }

    function onAddressbookCreate(data) {
      contactAddressbookService.getAddressbookByBookName(data.bookName).then(function(createdAddressbook) {
        $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.CREATED, createdAddressbook);
      });
    }

    function onAddressbookDelete(data) {
      $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.DELETED, data);
    }

    function onAddressbookUpdate(data) {
      contactAddressbookService.getAddressbookByBookName(data.bookName).then(function(updatedAddressbook) {
        $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.UPDATED, updatedAddressbook);
      });
    }

    function onAddressbookSubscriptionDelete(data) {
      $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.SUBSCRIPTION_DELETED, data);
    }

    function onAddressbookSubscriptionUpdate(data) {
      contactAddressbookService.getAddressbookByBookName(data.bookName).then(function(updatedAddressbook) {
        $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.UPDATED, updatedAddressbook);
      });
    }

    function onAddressbookSubscriptionCreate(data) {
      contactAddressbookService.getAddressbookByBookName(data.bookName).then(function(createdAddressbook) {
        $rootScope.$broadcast(CONTACT_ADDRESSBOOK_EVENTS.CREATED, createdAddressbook);
      });
    }
  }
})(angular);
