import zmq
import signal
import sys
import os
import logging
import json
from utils.sanitize_collection_name import sanitize_collection_name
from core.codebase.check_existing_collection import check_existing_collection


logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))  

from transport.zeromq.codebase_rag_handler import codebase_rag_handler 
from transport.zeromq.docs_rag_handler import docs_rag_handler 
from transport.zeromq.agent_req_handler import agent_handler


class ZeroMQServer:
    def __init__(self, host: str = '127.0.0.1', port: str = '5500'):
        self.port = port
        self.host = host
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.ROUTER) 
        self.poller = zmq.Poller()
        self.clients = {}  # client_id -> metadata
        self.running = False

    def start(self):
        self.socket.bind(f"tcp://{self.host}:{self.port}")
        self.poller.register(self.socket, zmq.POLLIN) 
        self._setup_signal_handlers()
        self.running = True

        logger.info(f"\nServer started on tcp://{self.host}:{self.port}")
        self._event_loop()

    def _event_loop(self):
        while self.running:
            socks = dict(self.poller.poll(timeout=100))
            if self.socket in socks:
                self._handle_request()

    def _handle_request(self):
        try:
            parts = self.socket.recv_multipart()
            if len(parts) == 3:
                identity, empty, msg_bytes = parts
            elif len(parts) == 2:
                identity, msg_bytes = parts
            else:
                raise ValueError(f"Unexpected frame count: {len(parts)}")

            print(identity, msg_bytes)

            request = json.loads(msg_bytes.decode())
            logger.info(f"Received request from {identity}")

            self.clients[identity] = {}

            req_type = request.get('type')
            if req_type == 'agent':
                response = agent_handler(request)
            elif req_type == 'ping':
                return self.send_to_client(identity, {"success": True, "msg": "pong"})
            elif req_type == 'check_collection':
                exists = check_existing_collection(sanitize_collection_name(request.get('path')))
                return self.send_to_client(identity, {"success": True, "exists": exists})
            elif req_type == 'codebase':
                response = codebase_rag_handler(request)
            else:
                response = docs_rag_handler(request)

            self.send_to_client(identity, response)

        except Exception as e:
            logger.error(f"Request failed: {e}")
            # Ensure identity is defined before using it here
            if 'identity' in locals():
                self.send_to_client(identity, {"success": False, "error": str(e)})


    def send_to_client(self, client_id: bytes, data: dict):
        self.socket.send_multipart([
            client_id,
            b'',
            json.dumps(data).encode()
        ])

    def _setup_signal_handlers(self):
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)

    def shutdown(self, *_):
        print("\n\nServer shutdown initiated.")
        self.running = False
        self.socket.close()
        self.context.term()
        logger.info("Server shutdown complete.")

if __name__ == "__main__":
    server = ZeroMQServer()
    server.start()


# context = zmq.Context()
# socket = context.socket(zmq.REP)
# socket.bind("tcp://127.0.0.1:5555")

# poller = zmq.Poller()
# poller.register(socket, zmq.POLLIN)

# running = True
# def handle_exit(sig, frame):
#     global running
#     print("\nShutting down RAG ZeroMQ server...")
#     running = False

# signal.signal(signal.SIGINT, handle_exit)
# signal.signal(signal.SIGTERM, handle_exit)

# print("✅ ZeroMQ RAG server started on tcp://127.0.0.1:5555")

# while running:
#     socks = dict(poller.poll(timeout=100))
#     if socket in socks and socks[socket] == zmq.POLLIN:
#         request = socket.recv_json()
#         print(request.get('type'))
#         if(request.get('type') == 'codebase'):
#             response = codebase_rag_handler(request)
#         else:
#             response = docs_rag_handler(request)
#         # print(response)
#         socket.send_json(response)

# socket.close()
# context.term()
# print("✅ Server shut down cleanly.")
