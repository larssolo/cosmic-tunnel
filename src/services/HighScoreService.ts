
import { HighScore } from "@/types/gameTypes";

// Google Sheets API Endpoint for the provided sheet
const SHEET_ID = '1xkrpaooaBhwgCP0Av2FRhqh8c5sef7kPgQ7K-tU-7rw';
const SHEET_NAME = 'Sheet1';
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;
const API_KEY = 'AIzaSyDeR2YpnWbSvS-xJ-WLhZBk7v_pxjifIkg'; // Public API key for this demo

export const HighScoreService = {
  // Get top 5 high scores
  async getTopScores(): Promise<HighScore[]> {
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`);
      const data = await response.json();
      
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      // Skip header row, convert values to HighScore objects
      const scores: HighScore[] = data.values.slice(1).map((row: string[]) => ({
        playerName: row[0] || 'Unknown',
        score: parseInt(row[1]) || 0,
        date: row[2] || new Date().toISOString().split('T')[0]
      }));
      
      // Sort by score (highest first) and return top 5
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      return [];
    }
  },
  
  // Add a new high score
  async addScore(playerName: string, score: number): Promise<boolean> {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get current values to find the next empty row
      const currentResponse = await fetch(`${API_URL}?key=${API_KEY}`);
      const currentData = await currentResponse.json();
      const nextRow = (currentData.values?.length || 0) + 1;
      
      // Append new row
      const appendResponse = await fetch(
        `${API_URL}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[playerName, score.toString(), date]]
          })
        }
      );
      
      return appendResponse.ok;
    } catch (error) {
      console.error('Error adding high score:', error);
      return false;
    }
  }
};
