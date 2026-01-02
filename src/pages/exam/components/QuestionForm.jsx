import { useState } from "react";

const QuestionForm = ({ type, onAdd }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(null);
  const [marks, setMarks] = useState(10); // Higher default for coding
  const [image, setImage] = useState(null);

  // Coding Specific State
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [starterCode, setStarterCode] = useState("// Write your solution here...");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!question.trim()) return;

    let payload = { type, question, image, marks: parseInt(marks) || 0 };

    if (type === "quiz") {
      if (correctOption === null && options.some(o => o.trim() !== "")) {
        // Validation
      }
      payload.options = options;
      payload.correctOption = correctOption;
    } else if (type === "coding") {
      payload.language = codeLanguage;
      payload.starterCode = starterCode;
    }

    onAdd(payload);

    // reset form
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption(null);
    setMarks(type === 'coding' ? 10 : 5);
    setImage(null);
    setStarterCode("// Write your solution here...");
  };

  return (
    <div className="bg-white p-4">
      {/* Header with Type and Marks */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className={`badge rounded-pill px-3 py-2 ${type === 'quiz' ? 'bg-primary bg-opacity-10 text-primary' :
            type === 'coding' ? 'bg-dark text-white' :
              type === 'abacus' ? 'bg-danger bg-opacity-10 text-danger' :
                type === 'short' ? 'bg-info bg-opacity-10 text-info' :
                  'bg-warning bg-opacity-10 text-dark'
            }`}>
            <i className={`bi ${type === 'quiz' ? 'bi-list-ul' :
              type === 'coding' ? 'bi-code-slash' :
                type === 'abacus' ? 'bi-calculator' :
                  type === 'short' ? 'bi-text-paragraph' : 'bi-journal-text'
              } me-2`}></i>
            {type === 'quiz' ? 'Multiple Choice' : type === 'coding' ? 'Coding Challenge' : type === 'abacus' ? 'Abacus / Mental Math' : type === 'short' ? 'Short Answer' : 'Long Essay'}
          </span>
        </div>
        <div className="d-flex align-items-center">
          <label className="text-muted small fw-bold me-2 text-uppercase ls-1">Marks:</label>
          <input
            type="number"
            min="1"
            className="form-control form-control-sm text-center fw-bold border-0 bg-light text-primary"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            style={{ width: "60px" }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold text-uppercase ls-1">Question Text</label>
        <textarea
          className="form-control border-0 bg-light shadow-sm"
          style={{ resize: "none" }}
          rows="3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Enter your ${type === 'quiz' ? 'choice' : ''} question here...`}
        ></textarea>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold text-uppercase ls-1 d-flex justify-content-between">
          <span>Attachment <span className="text-secondary fw-normal text-capitalize">(Optional)</span></span>
          {image && <button onClick={() => setImage(null)} className="btn btn-link p-0 text-danger small text-decoration-none">Remove</button>}
        </label>

        {!image ? (
          <div className="position-relative">
            <input
              type="file"
              accept="image/*"
              className="form-control opacity-0 position-absolute w-100 h-100"
              style={{ cursor: "pointer", zIndex: 5 }}
              onChange={handleImageChange}
            />
            <div className="border border-dashed border-2 rounded-3 p-3 text-center bg-light">
              <i className="bi bi-cloud-upload text-primary fs-4 mb-2 d-block"></i>
              <span className="text-muted small">Click to upload an image reference</span>
            </div>
          </div>
        ) : (
          <div className="position-relative border rounded overflow-hidden bg-light text-center">
            <img src={image} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }} />
          </div>
        )}
      </div>

      {/* Options for Quiz */}
      {type === "quiz" && (
        <div className="mb-4 animate-fade-in">
          <label className="form-label text-muted small fw-bold text-uppercase ls-1 mb-3">
            Answer Options
            <span className="text-muted fw-normal ms-2 text-capitalize small">(Select the radio button for the correct answer)</span>
          </label>

          <div className="vstack gap-2">
            {options.map((opt, i) => (
              <div key={i} className={`d-flex align-items-center p-1 rounded border-2 ${correctOption === i ? 'border border-success bg-success bg-opacity-10' : 'border border-transparent'}`}>
                <div className="form-check ms-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="correctOption"
                    checked={correctOption === i}
                    onChange={() => setCorrectOption(i)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <input
                  className="form-control border-0 bg-transparent"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...options];
                    copy[i] = e.target.value;
                    setOptions(copy);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coding Question Specifics */}
      {type === "coding" && (
        <div className="mb-4 animate-fade-in">
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1">Target Language</label>
            <select className="form-select border-0 bg-light shadow-sm" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}>
              <option value="javascript">JavaScript / Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="html">HTML / CSS</option>
              <option value="sql">SQL</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="all">Any / Pseudo-code</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1">Starter Code / Template</label>
            <textarea
              className="form-control font-monospace small bg-dark text-light border-0"
              rows="6"
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              spellCheck="false"
            ></textarea>
            <div className="form-text small">This code will be presented to the student as a starting point.</div>
          </div>
        </div>
      )}

      {/* Answer Preview for Non-Quiz/Non-Coding */}
      {(type === "short" || type === "long" || type === "abacus") && (
        <div className="mb-4">
          <label className="form-label text-muted small fw-bold text-uppercase ls-1">Answer Space Preview</label>
          {type === 'abacus' ? (
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded border border-secondary border-opacity-25">
              <div className="fw-bold fs-4 text-dark font-monospace border-bottom border-dark px-3">
                ?
              </div>
              <span className="text-muted fst-italic small">(Numeric Input Field)</span>
            </div>
          ) : (
            <div className="form-control bg-light text-muted fst-italic border-0" style={{ height: type === 'short' ? '80px' : '150px' }}>
              Student answer area...
            </div>
          )}
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
        onClick={handleAdd}
        disabled={!question.trim() || (type === 'quiz' && correctOption === null)}
      >
        <i className="bi bi-plus-lg me-2"></i>
        Add to Exam
      </button>
    </div>
  );
};

export default QuestionForm;
