// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System;
using Dolittle.Artifacts;
using Dolittle.DependencyInversion;
using Dolittle.Events;
using Dolittle.Execution;
using Dolittle.Tenancy;
using Microsoft.AspNetCore.Mvc;

namespace Head
{
    [Route("/api/Events")]
    public class EventsController : Controller
    {
        readonly IExecutionContextManager _executionContextManager;
        readonly FactoryFor<IEventStore> _eventStore;

        public EventsController(IExecutionContextManager executionContextManager, FactoryFor<IEventStore> eventStore)
        {
            _executionContextManager = executionContextManager;
            _eventStore = eventStore;
        }

        [HttpGet]
        public IActionResult Status()
        {
            return Ok("Everything is OK");
        }

        [HttpPost]
        [Route("Single")]
        public IActionResult SingleEvent()
        {
            _executionContextManager.CurrentFor((TenantId)Guid.Parse("f79fcfc9-c855-4910-b445-1f167e814bfd"));
            var eventStore = _eventStore();
            var events = new UncommittedEvents();
            events.Append(new MyEvent());
            eventStore.Commit(events);
            return Ok();
        }
    }
}