// ... all your existing imports
import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/UserContext';

const Project = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [users, setusers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiFileTree, setAiFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const messageBox = useRef(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSelected = new Set(prev);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      return newSelected;
    });
  };

  function addCollaborators() {
    axios
      .put('/projects/add-user', {
        projectId: project._id,
        users: Array.from(selectedUserId),
      })
      .then(() => setIsModalOpen(false))
      .catch(console.log);
  }

  const send = () => {
    sendMessage('project-message', {
      message,
      sender: user._id,
      email: user.email,
    });
    setMessages((prev) => [...prev, { message, sender: user._id, email: user.email }]);
    setMessage('');
  };

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage('project-message', (data) => {
      setMessages((prev) => [...prev, data]);

      // FIXED: Parse JSON only if it's a string
      try {
        const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
        if (parsed && parsed.fileTree) {
          setAiFileTree(parsed.fileTree);
          const files = Object.entries(parsed.fileTree);
          if (files.length > 0) {
            const [firstKey, firstVal] = files[0];
            setSelectedFile({ name: firstKey, content: firstVal.file.contents });
          }
        }
      } catch {
  // Not a valid JSON, do nothing
}

    });

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => setProject(res.data.project))
      .catch(console.log);

    axios
      .get('/users/all')
      .then((res) => setusers(res.data.users))
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  const scrollbarStyle = (
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(100, 116, 139, 0.8);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background-color: transparent;
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(100,116,139,0.8) transparent;
      }
    `}</style>
  );

  return (
    <main className="h-screen w-screen flex">
      {scrollbarStyle}

      {/* Sidebar */}
      <section className="left relative flex flex-col h-screen w-80 bg-slate-300">
        <header className="flex justify-between items-center p-4 w-full bg-slate-100 sticky top-0 z-10">
          {!isSidePanelOpen ? (
            <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
              <i className="ri-add-fill mr-1"></i>
              <p>Add collaborator</p>
            </button>
          ) : (
            <button className="flex gap-2 cursor-default" disabled>
              <i className="ri-group-fill mr-1"></i>
              <p>Collaborators</p>
            </button>
          )}
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
            <i className={isSidePanelOpen ? 'ri-close-line' : 'ri-user-fill'}></i>
          </button>
        </header>

        {/* Message Display */}
        <div
          ref={messageBox}
          className="conversation-area flex-grow flex flex-col px-2 pt-2 pb-1 space-y-2 overflow-y-auto custom-scrollbar"
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === user._id;
            const isCode = msg.message.trim().startsWith('```');

            return (
              <div
                key={index}
                className={`message break-words p-2 rounded-md shadow-sm max-w-[90%] ${
                  isUser ? 'ml-auto bg-blue-100' : 'bg-white'
                }`}
              >
                <small className="opacity-65 text-xs text-black">{msg.email}</small>
                {isCode ? (
                  <div className="overflow-x-auto mt-1 rounded-md custom-scrollbar">
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{ padding: '1em', borderRadius: '8px', minWidth: 'fit-content' }}
                    >
                      {msg.message.replace(/```(?:\w+)?/, '').replace(/```$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-black">{msg.message}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Box */}
        <div className="w-full flex p-2 bg-slate-300">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 text-black px-4 rounded-md border-none outline-none"
            type="text"
            placeholder="Enter message"
          />
          <button onClick={send} className="p-2 ml-2 bg-black text-white rounded-md">
            <i className="ri-send-plane-2-fill" />
          </button>
        </div>

        {/* Collaborator Side Panel */}
        <div
          className={`sidePanel w-72 h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
          } top-0 custom-scrollbar`}
        >
          <header className="flex justify-between items-center p-4 w-full bg-slate-100 sticky top-0 z-10">
            <div className="flex gap-2 items-center cursor-default">
              <i className="ri-close-large-line"></i>
              <p>Collaborators</p>
            </div>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
              <i className="ri-close-line"></i>
            </button>
          </header>

          <div className="users flex flex-col">
            {project.users &&
              project.users.map((user) => (
                <div key={user._id} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-slate-600">
                    <i className="ri-user-fill text-sm"></i>
                  </div>
                  <h3 className="font-semibold text-black text-xs leading-none">{user.email}</h3>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Right Panel — File Tree Viewer */}
      <section className="flex-grow bg-white flex flex-col">
        {aiFileTree ? (
          <>
            <div className="flex gap-2 border-b px-4 py-2 bg-slate-100">
              {Object.entries(aiFileTree).map(([name]) => (
                <button
                  key={name}
                  onClick={() => setSelectedFile({ name, content: aiFileTree[name].file.contents })}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedFile?.name === name ? 'bg-blue-600 text-white' : 'bg-slate-300 text-black'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="flex-grow overflow-auto p-4">
              {selectedFile && (
                <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                  {selectedFile.content}
                </SyntaxHighlighter>
              )}
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            AI file structure will appear here
          </div>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-md w-96 shadow-lg flex flex-col max-h-[80vh] relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-md font-semibold text-black">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-black">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="overflow-y-auto flex-grow p-4 space-y-2 custom-scrollbar">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).includes(user._id) ? 'bg-slate-200' : ''
                  } p-2 flex gap-2 items-center`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-slate-600">
                    <i className="ri-user-fill text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{user.email}</span>
                </div>
              ))}
            </div>
            <div className="border-t p-4">
              <button
                onClick={addCollaborators}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
