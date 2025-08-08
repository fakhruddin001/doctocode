import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CodeLine {
  text: string;
  color: string;
  indent: number;
}

interface CodeTypingAnimationProps {
  isCsharp: string;
}

const CodeTypingAnimation: React.FC<CodeTypingAnimationProps>  = ({ isCsharp }: CodeTypingAnimationProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [displayedLines, setDisplayedLines] = useState<CodeLine[]>([]);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  
  // Refs for auto-scroll functionality
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  let codeLines: CodeLine[] 
  if(isCsharp){
    codeLines= [
      { text: 'public class DocumentService : IDocumentService', color: 'text-blue-400', indent: 0 },
      { text: '{', color: 'text-purple-400', indent: 0 },
      { text: '    public async Task<string> ProcessDocumentAsync(', color: 'text-blue-400', indent: 1 },
      { text: '        IFormFile document)', color: 'text-blue-400', indent: 2 },
      { text: '    {', color: 'text-purple-400', indent: 1 },
      { text: '        // Parse document content', color: 'text-gray-500', indent: 2 },
      { text: '        var content = await ExtractTextAsync(document);', color: 'text-green-400', indent: 2 },
      { text: '', color: 'text-gray-400', indent: 2 },
      { text: '        // Analyze structure', color: 'text-gray-500', indent: 2 },
      { text: '        var structure = AnalyzeStructure(content);', color: 'text-yellow-400', indent: 2 },
      { text: '', color: 'text-gray-400', indent: 2 },
      { text: '        // Generate code', color: 'text-gray-500', indent: 2 },
      { text: '        var codeBuilder = new StringBuilder();', color: 'text-cyan-400', indent: 2 },
      { text: '        foreach (var section in structure.Sections)', color: 'text-pink-400', indent: 2 },
      { text: '        {', color: 'text-purple-400', indent: 2 },
      { text: '            codeBuilder.AppendLine(', color: 'text-orange-400', indent: 3 },
      { text: '                GenerateCodeSection(section));', color: 'text-orange-400', indent: 4 },
      { text: '        }', color: 'text-purple-400', indent: 2 },
      { text: '', color: 'text-gray-400', indent: 2 },
      { text: '        return codeBuilder.ToString();', color: 'text-red-400', indent: 2 },
      { text: '    }', color: 'text-purple-400', indent: 1 },
      { text: '}', color: 'text-purple-400', indent: 0 }
    ];
  }else{
    codeLines=[
  { "text": "class DocumentService {", "color": "text-blue-400", "indent": 0 },
  { "text": "    async processDocumentAsync(", "color": "text-blue-400", "indent": 1 },
  { "text": "        document)", "color": "text-blue-400", "indent": 2 },
  { "text": "    {", "color": "text-purple-400", "indent": 1 },
  { "text": "        // Parse document content", "color": "text-gray-500", "indent": 2 },
  { "text": "        const content = await this.extractTextAsync(document);", "color": "text-green-400", "indent": 2 },
  { "text": "", "color": "text-gray-400", "indent": 2 },
  { "text": "        // Analyze structure", "color": "text-gray-500", "indent": 2 },
  { "text": "        const structure = this.analyzeStructure(content);", "color": "text-yellow-400", "indent": 2 },
  { "text": "", "color": "text-gray-400", "indent": 2 },
  { "text": "        // Generate code", "color": "text-gray-500", "indent": 2 },
  { "text": "        const codeBuilder = [];", "color": "text-cyan-400", "indent": 2 },
  { "text": "        for (const section of structure.sections)", "color": "text-pink-400", "indent": 2 },
  { "text": "        {", "color": "text-purple-400", "indent": 2 },
  { "text": "            codeBuilder.push(", "color": "text-orange-400", "indent": 3 },
  { "text": "                this.generateCodeSection(section));", "color": "text-orange-400", "indent": 4 },
  { "text": "        }", "color": "text-purple-400", "indent": 2 },
  { "text": "", "color": "text-gray-400", "indent": 2 },
  { "text": "        return codeBuilder.join('\\n');", "color": "text-red-400", "indent": 2 },
  { "text": "    }", "color": "text-purple-400", "indent": 1 },
  { "text": "}", "color": "text-purple-400", "indent": 0 }
]
  }
    
    // Auto-scroll function
  const scrollToBottom = () => {
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      
      // Check if content height exceeds container height
      if (content.scrollHeight > container.clientHeight) {
        // Smooth scroll to bottom
        container.scrollTo({
          top: content.scrollHeight - container.clientHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return;

    const currentLine = codeLines[currentLineIndex];
    let typingSpeed: number = 10;
    
    const currentChar: string = currentLine.text[currentCharIndex];
    if (['{', '}', ';', '(', ')', ',', '[', ']'].includes(currentChar)) {
      typingSpeed += 150;
    }
    if (currentChar === '\n' || currentCharIndex === 0) {
      typingSpeed += 300;
    }

    const timer = setTimeout(() => {
      if (currentCharIndex < currentLine.text.length) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setDisplayedLines(prev => [...prev, currentLine]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        
        // Trigger auto-scroll when a line is completed
        setTimeout(scrollToBottom, 100);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, codeLines]);

  // Auto-scroll when typing within a line (for long lines)
  useEffect(() => {
    if (currentCharIndex > 0) {
      setTimeout(scrollToBottom, 50);
    }
  }, [currentCharIndex]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="font-mono text-sm leading-normal h-full overflow-y-auto overflow-x-hidden p-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 #1F2937'
      }}
    >
      <div ref={contentRef} className="flex min-h-full">
        <div className="text-gray-600 text-right pr-3 select-none min-w-[2rem] flex-shrink-0">
          {displayedLines.map((_, index: number) => (
            <div key={index} className="leading-normal">
              {index + 1}
            </div>
          ))}
          {currentLineIndex < codeLines.length && (
            <div className="leading-normal">
              {displayedLines.length + 1}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          {displayedLines.map((line: CodeLine, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${line.color} leading-normal break-words`}
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {line.text || '\u00A0'} {/* Non-breaking space for empty lines */}
            </motion.div>
          ))}
          
          {currentLineIndex < codeLines.length && (
            <div 
              className={`${codeLines[currentLineIndex].color} leading-normal relative break-words`}
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {codeLines[currentLineIndex].text.substring(0, currentCharIndex) || '\u00A0'}
              <motion.span
                className="inline-block w-0.5 h-5 bg-white ml-0.5"
                animate={{ opacity: showCursor ? 1 : 0 }}
                transition={{ duration: 0 }}
              />
            </div>
          )}
        </div>
      </div>
      
      {currentLineIndex >= codeLines.length && (
        <motion.div
          className="w-0.5 h-5 bg-white mt-1 ml-10"
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0 }}
        />
      )}
    </div>
  );
};

export default CodeTypingAnimation;