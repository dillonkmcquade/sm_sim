import { Collection, ObjectId } from "mongodb";
import type { Update, User } from "../types.d.ts";
import { Request, Response } from "express";

export class UserController {
  constructor(private readonly usersCollection: Collection<User>) {}

  async findOne(req: Request, res: Response) {
    const auth = req.auth?.payload.sub;
    try {
      const user = await this.usersCollection.findOne({ sub: auth });
      if (!user) {
        return res.status(404).json({ status: 404, message: "User not found" });
      }
      return res.status(200).json({
        status: 200,
        data: user,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  /**
   * Finds user, creates a new user if it does not exist
   */
  async create(req: Request, res: Response) {
    const auth = req.auth!.payload.sub; // User ID
    const { user: userDto } = req.body; // auth0 user object

    //validate that we are receiving the user obj
    if (!userDto) {
      return res
        .status(400)
        .json({ status: 400, message: "missing user UUID" });
    }

    try {
      // If user already exists, return user object
      const user = await this.usersCollection.findOne({
        sub: auth,
      });
      if (user) {
        return res
          .status(200)
          .json({ status: 200, data: user, message: "User exists" });
      }

      // If user does not exist, create new user in database
      const newUser: User = {
        _id: new ObjectId(),
        balance: 1000000,
        holdings: [],
        watchList: [],
        ...userDto,
      };
      await this.usersCollection.insertOne(newUser);

      // return new user
      return res.status(201).json({
        status: 201,
        message: "User created",
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }

  /**
   * @Patch
   */
  async update(req: Request, res: Response) {
    const auth = req.auth!.payload.sub;
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No update paramaters given.",
      });
    }

    //limit the updateable user fields
    function isUpdate(obj: Update): boolean {
      const dumData = new Set<string>([
        "name",
        "nickname",
        "email",
        "address",
        "telephone",
      ]);
      const keys = Object.keys(obj);
      return keys.every((key) => dumData.has(key));
    }

    // if it fails the test, return bad request
    if (!isUpdate(req.body)) {
      return res.status(400).json({
        status: 400,
        message: "Bad request, unrecognized properties of request body",
      });
    }

    try {
      // update given fields in DB
      const update = await this.usersCollection.updateOne(
        { sub: auth },
        { $set: req.body },
      );

      // handle DB errors
      if (update.matchedCount === 0 || update.modifiedCount === 0) {
        return res.status(404).json({
          status: 404,
          message: "Invalid data given. Check variable names in request body",
        });
      }

      // retrieve new user object
      const newUser = await this.usersCollection.findOne({ sub: auth });

      //return updated user object
      return res.status(200).json({
        status: 200,
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }

  /**
   * @Delete
   */
  async delete(req: Request, res: Response) {
    const auth = req.auth?.payload.sub; // User ID
    try {
      // Return not found if user doesn't exist
      const update = await this.usersCollection.deleteOne({ sub: auth });
      if (update.deletedCount === 0) {
        return res.status(404).json({
          status: 404,
          message: "Invalid user id",
        });
      }
      return res.status(200).json({ status: 200, message: "Account deleted" });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }

  async toggleWatchList(req: Request, res: Response) {
    const auth = req.auth!.payload.sub;
    const { ticker, isWatched }: { ticker: string; isWatched: boolean } =
      req.body;
    if (!ticker || isWatched === undefined) {
      return res.status(400).json({
        status: 400,
        message: "missing data",
      });
    }
    try {
      // check if user exists
      const user = await this.usersCollection.findOne({ sub: auth });
      if (!user) {
        return res.status(404).json({ status: 200, message: "user not found" });
      }

      // do nothing if the requested change is already in effect
      if (
        (isWatched && user.watchList.includes(ticker)) ||
        (!isWatched && !user.watchList.includes(ticker))
      ) {
        //do nothing
        return res.status(204);
      }

      // update user watch list
      if (isWatched && !user.watchList.includes(ticker)) {
        //Add
        user.watchList.push(ticker);
      } else if (!isWatched && user.watchList.includes(ticker)) {
        //Remove
        user.watchList.splice(user.watchList.indexOf(ticker));
      }

      // replace user
      const updateResult = await this.usersCollection.replaceOne(
        { sub: auth },
        user,
      );
      if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        return res
          .status(500)
          .json({ status: 500, message: "internal server error" });
      }

      // return updated user object
      return res.status(200).json({
        status: 200,
        data: user.watchList,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }
}
