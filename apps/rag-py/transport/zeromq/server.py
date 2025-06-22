import zmq
import signal
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))  

from transport.zeromq.handlers import handle_rag_request 


context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://127.0.0.1:5555")

poller = zmq.Poller()
poller.register(socket, zmq.POLLIN)

running = True
def handle_exit(sig, frame):
    global running
    print("\nShutting down RAG ZeroMQ server...")
    running = False

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

print("✅ ZeroMQ RAG server started on tcp://127.0.0.1:5555")

while running:
    socks = dict(poller.poll(timeout=100))
    if socket in socks and socks[socket] == zmq.POLLIN:
        request = socket.recv_json()
        print(request)
        response = handle_rag_request(request)
        # print(response)
        socket.send_json(response)

socket.close()
context.term()
print("✅ Server shut down cleanly.")
